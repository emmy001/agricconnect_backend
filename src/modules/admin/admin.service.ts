import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Professional, ProfessionalStatus } from '../professionals/entities/professional.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const totalProfessionals = await this.professionalRepository.count();
    const pendingVerifications = await this.professionalRepository.count({
      where: { verificationStatus: ProfessionalStatus.PENDING },
    });
    const totalBookings = await this.bookingRepository.count();
    const pendingPayouts = await this.paymentRepository.count({
      where: { status: PaymentStatus.PENDING },
    });
    const completedPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.COMPLETED },
    });
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers,
      activeUsers,
      totalProfessionals,
      pendingVerifications,
      totalBookings,
      pendingPayouts,
      totalRevenue,
      revenueGrowth: '+18%',
      bookingsGrowth: '+22%',
      usersGrowth: '+15%',
    };
  }

  async getUsers(params: { page: number; limit: number; role?: string; status?: string; search?: string }): Promise<{ data: User[]; total: number }> {
    const { page, limit, role, status, search } = params;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getUser(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    const user = await this.getUser(id);
    user.status = status;
    return this.userRepository.save(user);
  }

  async getPendingVerifications(): Promise<Professional[]> {
    return this.professionalRepository.find({
      where: { verificationStatus: ProfessionalStatus.PENDING },
      relations: ['user'],
    });
  }

  async getProfessionals(params: { page: number; limit: number; verificationStatus?: string }): Promise<{ data: Professional[]; total: number }> {
    const { page, limit, verificationStatus } = params;
    const queryBuilder = this.professionalRepository.createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user');

    if (verificationStatus) {
      queryBuilder.andWhere('professional.verificationStatus = :verificationStatus', { verificationStatus });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('professional.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async verifyProfessional(id: string, status: string, notes?: string): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!professional) {
      throw new Error('Professional not found');
    }

    professional.verificationStatus = status as ProfessionalStatus;
    professional.verificationNotes = notes;
    professional.verifiedAt = new Date();
    professional.verifiedBy = 'admin';

    // Update user verified status
    if (status === ProfessionalStatus.APPROVED) {
      professional.user.isVerified = true;
      await this.userRepository.save(professional.user);
    }

    return this.professionalRepository.save(professional);
  }

  async getPendingPayouts(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['user'],
    });
  }

  async getPayouts(params: { page: number; limit: number; status?: string }): Promise<{ data: Payment[]; total: number }> {
    const { page, limit, status } = params;
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user');

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

  async processPayout(id: string, status: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    payment.completedAt = new Date();
    return this.paymentRepository.save(payment);
  }

  async getReports(params: { type?: string; startDate?: string; endDate?: string }): Promise<any> {
    // Mock reports
    return {
      reports: [
        { id: '1', name: 'Monthly Revenue Report', type: 'revenue', date: '2024-01-01', status: 'completed' },
        { id: '2', name: 'User Growth Report', type: 'users', date: '2024-01-01', status: 'pending' },
      ],
    };
  }

  async generateReport(type: string, startDate: string, endDate: string): Promise<any> {
    return {
      success: true,
      reportId: 'rep_' + Date.now(),
      type,
      startDate,
      endDate,
      status: 'processing',
    };
  }

  async getFraudAlerts(): Promise<any> {
    return [
      {
        id: '1',
        title: 'Suspicious Transaction',
        description: 'Multiple failed payment attempts detected',
        severity: 'high',
        riskScore: 85,
        time: '5 min ago',
        status: 'active',
      },
    ];
  }

  async resolveFraudAlert(id: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async scanForFraud(): Promise<{ success: boolean; alerts: any[] }> {
    return {
      success: true,
      alerts: [],
    };
  }

  async getPages(): Promise<any> {
    return [
      { id: '1', title: 'Home Page', updatedAt: '2024-01-01' },
      { id: '2', title: 'About Us', updatedAt: '2024-01-02' },
    ];
  }

  async createPage(data: any): Promise<any> {
    return { id: 'page_' + Date.now(), ...data };
  }

  async updatePage(id: string, data: any): Promise<any> {
    return { id, ...data };
  }

  async deletePage(id: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async getPromotions(): Promise<any> {
    return [
      {
        id: '1',
        title: 'Summer Sale',
        description: '20% off all services',
        discount: 20,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        isActive: true,
      },
    ];
  }

  async createPromotion(data: any): Promise<any> {
    return { id: 'promo_' + Date.now(), ...data };
  }

  async updatePromotion(id: string, data: any): Promise<any> {
    return { id, ...data };
  }

  async deletePromotion(id: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async getSupportTickets(params: { page: number; limit: number; status?: string }): Promise<{ data: any[]; total: number }> {
    return {
      data: [
        {
          id: '1',
          subject: 'Payment Issue',
          message: 'My payment was not processed',
          priority: 'high',
          user: 'John Doe',
          time: '2 hours ago',
          status: 'pending',
        },
      ],
      total: 1,
    };
  }

  async resolveTicket(id: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async getSupportChats(): Promise<any> {
    return [
      {
        id: '1',
        user: 'Jane Smith',
        lastMessage: 'I need help with my booking',
        isOnline: true,
        time: '1 min ago',
      },
    ];
  }
}