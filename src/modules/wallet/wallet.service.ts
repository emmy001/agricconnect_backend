import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction, TransactionType, TransactionStatus } from './entities/wallet-transaction.entity';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import { NotificationPriority, NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balance: 0,
        currency: 'KES',
      });
      await this.walletRepository.save(wallet);
    }
    return wallet;
  }

  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async getTransactions(
    userId: string,
    params: { page: number; limit: number; type?: string; status?: string }
  ): Promise<{ data: WalletTransaction[]; total: number }> {
    const wallet = await this.getOrCreateWallet(userId);
    const { page, limit, type, status } = params;
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId: wallet.id });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('transaction.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getTransaction(id: string): Promise<WalletTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['wallet'],
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async deposit(userId: string, depositDto: DepositDto): Promise<{ success: boolean; transaction: WalletTransaction }> {
    const wallet = await this.getOrCreateWallet(userId);
    const { amount, method, phone, cardNumber, expiry, cvv } = depositDto;

    // Process payment based on method
    // This would integrate with payment gateway
    // For now, simulate success

    // Create transaction
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount,
      balance: wallet.balance + amount,
      description: `Deposit via ${method}`,
      reference: 'DEP_' + Date.now(),
      metadata: { method, phone },
    });

    // Update wallet balance
    wallet.balance += amount;
    wallet.totalEarned += amount;

    await this.walletRepository.save(wallet);
    await this.transactionRepository.save(transaction);

    // Send notification
    await this.notificationsService.sendPaymentNotification(userId, {
      id: transaction.id,
      amount,
      type: 'deposit',
    });

    return {
      success: true,
      transaction,
    };
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto): Promise<{ success: boolean; transaction: WalletTransaction }> {
    const wallet = await this.getOrCreateWallet(userId);
    const { amount, method, phone, bankName, accountNumber, accountName } = withdrawDto;

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Process withdrawal based on method
    // This would integrate with payment gateway

    // Create transaction
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      amount: -amount,
      balance: wallet.balance - amount,
      description: `Withdrawal via ${method}`,
      reference: 'WIT_' + Date.now(),
      metadata: { method, phone, bankName, accountNumber, accountName },
    });

    // Update wallet balance
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;

    await this.walletRepository.save(wallet);
    await this.transactionRepository.save(transaction);

    return {
      success: true,
      transaction,
    };
  }

  async transfer(userId: string, transferDto: TransferDto): Promise<{ success: boolean; transaction: WalletTransaction }> {
    const { recipientId, amount, description } = transferDto;

    if (userId === recipientId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const senderWallet = await this.getOrCreateWallet(userId);
    if (senderWallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Get recipient wallet
    const recipientWallet = await this.getOrCreateWallet(recipientId);

    // Deduct from sender
    senderWallet.balance -= amount;
    await this.walletRepository.save(senderWallet);

    // Add to recipient
    recipientWallet.balance += amount;
    await this.walletRepository.save(recipientWallet);

    // Create sender transaction
    const senderTransaction = this.transactionRepository.create({
      walletId: senderWallet.id,
      type: TransactionType.PAYMENT,
      status: TransactionStatus.COMPLETED,
      amount: -amount,
      balance: senderWallet.balance,
      description: description || `Transfer to ${recipientId}`,
      reference: 'TRF_' + Date.now(),
      metadata: { recipientId },
    });
    await this.transactionRepository.save(senderTransaction);

    // Create recipient transaction
    const recipientTransaction = this.transactionRepository.create({
      walletId: recipientWallet.id,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: amount,
      balance: recipientWallet.balance,
      description: description || `Transfer from ${userId}`,
      reference: 'TRF_' + Date.now(),
      metadata: { senderId: userId },
    });
    await this.transactionRepository.save(recipientTransaction);

    // Send notifications
    await this.notificationsService.create({
      userId: recipientId,
      title: 'Money Received',
      body: `You received KES ${amount} from a user`,
      type: NotificationType.TRANSACTION,
      priority: NotificationPriority.HIGH,
      data: { amount, senderId: userId },
    });

    return {
      success: true,
      transaction: senderTransaction,
    };
  }

  async getStats(userId: string): Promise<any> {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await this.transactionRepository.find({
      where: { walletId: wallet.id },
    });

    const totalEarned = transactions
      .filter(t => t.type === TransactionType.DEPOSIT || t.type === TransactionType.REFERRAL)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter(t => t.type === TransactionType.PAYMENT || t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      balance: wallet.balance,
      totalEarned,
      totalSpent,
      totalWithdrawn: wallet.totalWithdrawn,
      bonusPoints: wallet.bonusPoints,
      transactionCount: transactions.length,
    };
  }

  async getReferralInfo(userId: string): Promise<any> {
    const wallet = await this.getOrCreateWallet(userId);
    const code = await this.generateReferralCode(userId);
    
    return {
      referralCode: code,
      bonusPoints: wallet.bonusPoints,
      referrals: [], // Would fetch from database
    };
  }

  async generateReferralCode(userId: string): Promise<string> {
    // Generate unique referral code
    const code = userId.slice(0, 6).toUpperCase() + crypto.randomInt(1000, 9999);
    return code;
  }

  async claimReferralBonus(userId: string, code: string): Promise<{ success: boolean }> {
    const wallet = await this.getOrCreateWallet(userId);
    const bonusAmount = 100; // KES 100 bonus
    
    // Add bonus
    wallet.balance += bonusAmount;
    wallet.bonusPoints += 100;
    await this.walletRepository.save(wallet);

    // Create bonus transaction
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.REFERRAL,
      status: TransactionStatus.COMPLETED,
      amount: bonusAmount,
      balance: wallet.balance,
      description: 'Referral bonus',
      reference: 'REF_' + Date.now(),
      metadata: { code },
    });
    await this.transactionRepository.save(transaction);

    return { success: true };
  }

  async getCoupons(userId: string, active?: boolean): Promise<any[]> {
    // Implementation depends on coupon system
    return [];
  }

  async applyCoupon(userId: string, code: string): Promise<any> {
    // Implementation depends on coupon system
    return { success: true, discount: 0 };
  }

  // Internal methods for other services
  async addBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += amount;
    await this.walletRepository.save(wallet);
  }

  async deductBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    wallet.balance -= amount;
    await this.walletRepository.save(wallet);
  }

  async createTransaction(data: {
    walletId: string;
    type: TransactionType;
    amount: number;
    description: string;
    reference?: string;
    metadata?: any;
  }): Promise<WalletTransaction> {
    const wallet = await this.walletRepository.findOne({ where: { id: data.walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transaction = this.transactionRepository.create({
      walletId: data.walletId,
      type: data.type,
      status: TransactionStatus.COMPLETED,
      amount: data.amount,
      balance: wallet.balance + data.amount,
      description: data.description,
      reference: data.reference,
      metadata: data.metadata,
      completedAt: new Date(),
    });

    return this.transactionRepository.save(transaction);
  }
}