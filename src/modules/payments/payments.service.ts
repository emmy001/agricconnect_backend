import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Escrow, EscrowStatus } from './entities/escrow.entity';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Escrow)
    private escrowRepository: Repository<Escrow>,
    private bookingsService: BookingsService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async initializePayment(userId: string, initializePaymentDto: InitializePaymentDto): Promise<any> {
    const { amount, currency, paymentMethod, bookingId, phoneNumber, cardToken } = initializePaymentDto;

    // Validate booking
    if (bookingId) {
      await this.bookingsService.findById(bookingId);
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      userId,
      bookingId,
      amount,
      currency: currency || 'KES',
      method: paymentMethod as PaymentMethod,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    // Process based on payment method
    let result;
    switch (paymentMethod) {
      case PaymentMethod.MPESA:
        result = await this.initiateMpesaPayment(payment, phoneNumber);
        break;
      case PaymentMethod.CARD:
        result = await this.initiateCardPayment(payment, cardToken);
        break;
      case PaymentMethod.WALLET:
        result = await this.initiateWalletPayment(payment);
        break;
      default:
        throw new BadRequestException('Unsupported payment method');
    }

    return result;
  }

  async initiateMpesaPayment(payment: Payment, phoneNumber: string): Promise<any> {
    // M-Pesa STK Push implementation
    // This would integrate with Safaricom API
    const checkoutRequestId = 'MPESA_' + Date.now();
    
    payment.mpesaCheckoutRequestId = checkoutRequestId;
    payment.metadata = {
      ...payment.metadata,
      phoneNumber,
      checkoutRequestId,
    };
    await this.paymentRepository.save(payment);

    return {
      success: true,
      paymentId: payment.id,
      checkoutRequestId,
      status: PaymentStatus.PROCESSING,
    };
  }

  async initiateCardPayment(payment: Payment, cardToken: string): Promise<any> {
    // Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100),
      currency: payment.currency.toLowerCase(),
      payment_method: cardToken,
      confirm: true,
    });

    payment.transactionId = paymentIntent.id;
    payment.status = PaymentStatus.PROCESSING;
    payment.metadata = {
      ...payment.metadata,
      stripePaymentIntentId: paymentIntent.id,
    };
    await this.paymentRepository.save(payment);

    return {
      success: true,
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      status: PaymentStatus.PROCESSING,
    };
  }

  async initiateWalletPayment(payment: Payment): Promise<any> {
    // Check wallet balance
    const walletBalance = await this.usersService.getWalletBalance(payment.userId);
    if (walletBalance < payment.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Deduct from wallet
    await this.usersService.deductWalletBalance(payment.userId, payment.amount);

    payment.status = PaymentStatus.COMPLETED;
    payment.completedAt = new Date();
    await this.paymentRepository.save(payment);

    return {
      success: true,
      paymentId: payment.id,
      status: PaymentStatus.COMPLETED,
    };
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<any> {
    const { reference, paymentId } = verifyPaymentDto;
    
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify based on payment method
    let status = PaymentStatus.COMPLETED;
    
    if (payment.method === PaymentMethod.MPESA) {
      // Verify M-Pesa transaction
      // Call Safaricom API to check status
      const mpesaStatus = await this.verifyMpesaTransaction(reference);
      status = mpesaStatus ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
    }

    payment.status = status;
    if (status === PaymentStatus.COMPLETED) {
      payment.completedAt = new Date();
      payment.reference = reference;
      
      // Create escrow if needed
      await this.createEscrow(payment);
      
      // Send notifications
      await this.notificationsService.sendPaymentNotification(payment.userId, payment);
    }
    await this.paymentRepository.save(payment);

    return {
      success: status === PaymentStatus.COMPLETED,
      paymentId: payment.id,
      status,
    };
  }

  async verifyMpesaTransaction(reference: string): Promise<boolean> {
    // Simulate M-Pesa verification
    return true;
  }

  async createEscrow(payment: Payment): Promise<Escrow> {
    const booking = await this.bookingsService.findById(payment.bookingId);
    
    const escrow = this.escrowRepository.create({
      paymentId: payment.id,
      payerId: payment.userId,
      payeeId: booking.professionalId,
      amount: payment.amount,
      currency: payment.currency,
      status: EscrowStatus.HOLDING,
      conditions: {
        releaseOnCompletion: true,
        autoReleaseDays: 3,
      },
    });

    return this.escrowRepository.save(escrow);
  }

  async handleMpesaCallback(callbackData: any): Promise<void> {
    // Handle M-Pesa callback
    const { checkoutRequestId, resultCode, mpesaReceiptNumber } = callbackData;
    
    const payment = await this.paymentRepository.findOne({
      where: { mpesaCheckoutRequestId: checkoutRequestId },
    });

    if (!payment) return;

    if (resultCode === 0) {
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      payment.mpesaReceiptNumber = mpesaReceiptNumber;
      await this.paymentRepository.save(payment);
      
      // Create escrow
      await this.createEscrow(payment);
      
      // Send notification
      await this.notificationsService.sendPaymentNotification(payment.userId, payment);
    } else {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
    }
  }

  async handleStripeWebhook(event: any): Promise<void> {
    // Handle Stripe webhook events
    const { data } = event;
    const paymentIntent = data.object;

    const payment = await this.paymentRepository.findOne({
      where: { transactionId: paymentIntent.id },
    });

    if (!payment) return;

    if (paymentIntent.status === 'succeeded') {
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      await this.paymentRepository.save(payment);
      
      await this.createEscrow(payment);
      await this.notificationsService.sendPaymentNotification(payment.userId, payment);
    } else if (paymentIntent.status === 'failed') {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
    }
  }

  async getUserPayments(userId: string, params: { page: number; limit: number; status?: string }): Promise<{ data: Payment[]; total: number }> {
    const { page, limit, status } = params;
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('payment.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'booking'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async refundPayment(id: string, refundPaymentDto: RefundPaymentDto, userId: string): Promise<{ success: boolean }> {
    const payment = await this.getPayment(id);
    
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (payment.refundedAt) {
      throw new BadRequestException('Payment already refunded');
    }

    // Process refund
    if (payment.method === PaymentMethod.CARD) {
      await this.stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: Math.round(refundPaymentDto.amount * 100),
        reason: refundPaymentDto.reason,
      });
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      refundReason: refundPaymentDto.reason,
      refundedBy: userId,
    };
    await this.paymentRepository.save(payment);

    // Update escrow
    const escrow = await this.escrowRepository.findOne({
      where: { paymentId: payment.id },
    });
    if (escrow) {
      escrow.status = EscrowStatus.REFUNDED;
      await this.escrowRepository.save(escrow);
    }

    return { success: true };
  }

  async getEscrow(id: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { id },
      relations: ['payment', 'payer', 'payee'],
    });
    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }
    return escrow;
  }

  async releaseEscrow(id: string, userId: string): Promise<{ success: boolean }> {
    const escrow = await this.getEscrow(id);
    
    if (escrow.status !== EscrowStatus.HOLDING) {
      throw new BadRequestException('Escrow is not in holding status');
    }

    escrow.status = EscrowStatus.RELEASED;
    escrow.releaseDate = new Date();
    escrow.releasedTo = userId;
    await this.escrowRepository.save(escrow);

    // Release funds to payee
    await this.usersService.addWalletBalance(escrow.payeeId, escrow.amount);

    return { success: true };
  }

  async disputeEscrow(id: string, reason: string, userId: string): Promise<{ success: boolean }> {
    const escrow = await this.getEscrow(id);
    
    if (escrow.status !== EscrowStatus.HOLDING) {
      throw new BadRequestException('Escrow is not in holding status');
    }

    escrow.status = EscrowStatus.DISPUTED;
    escrow.metadata = {
      ...escrow.metadata,
      disputeReason: reason,
      disputedBy: userId,
      disputedAt: new Date(),
    };
    await this.escrowRepository.save(escrow);

    // Notify admin
    // ...

    return { success: true };
  }

  async resolveEscrow(id: string, resolution: string): Promise<{ success: boolean }> {
    const escrow = await this.getEscrow(id);
    
    if (escrow.status !== EscrowStatus.DISPUTED) {
      throw new BadRequestException('Escrow is not in disputed status');
    }

    // Resolution: 'release_to_payee' or 'release_to_payer'
    if (resolution === 'release_to_payee') {
      escrow.status = EscrowStatus.RELEASED;
      escrow.releaseDate = new Date();
      await this.usersService.addWalletBalance(escrow.payeeId, escrow.amount);
    } else {
      escrow.status = EscrowStatus.REFUNDED;
      await this.usersService.addWalletBalance(escrow.payerId, escrow.amount);
    }

    escrow.metadata = {
      ...escrow.metadata,
      resolution,
      resolvedBy: 'admin',
      resolvedAt: new Date(),
    };
    await this.escrowRepository.save(escrow);

    return { success: true };
  }

  async getPaymentStats(userId: string): Promise<any> {
    const stats = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount) as total')
      .addSelect('COUNT(payment.id) as count')
      .where('payment.userId = :userId', { userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      totalSpent: stats?.total || 0,
      totalTransactions: stats?.count || 0,
    };
  }
}