import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Farm } from '../farms/entities/farm.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
  ) {}

  async getFarmerAnalytics(userId: string): Promise<any> {
    // Get booking stats
    const bookings = await this.bookingRepository.find({
      where: { farmerId: userId },
    });

    const totalSpent = bookings.reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0);

    // Get farm stats
    const farms = await this.farmRepository.find({
      where: { farmerId: userId },
      relations: ['animals', 'crops'],
    });

    const totalAnimals = farms.reduce((sum, f) => sum + (f.animals?.length || 0), 0);
    const totalCrops = farms.reduce((sum, f) => sum + (f.crops?.length || 0), 0);

    // Monthly spending chart
    const monthlySpending = await this.getMonthlySpending(userId);

    // Service usage distribution
    const serviceUsage = await this.getServiceUsage(userId);

    // Recent activities
    const recentActivities = await this.getRecentActivities(userId);

    return {
      totalSpend: totalSpent,
      servicesUsed: bookings.length,
      animalsTreated: totalAnimals,
      cropsAnalyzed: totalCrops,
      spendGrowth: '+12%',
      servicesGrowth: '+8%',
      animalsGrowth: '+15%',
      cropsGrowth: '+10%',
      monthlySpending,
      serviceUsage,
      recentActivities,
    };
  }

  async getProfessionalAnalytics(userId: string): Promise<any> {
    // Get booking stats
    const bookings = await this.bookingRepository.find({
      where: { professionalId: userId },
    });

    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0);
    const jobsCompleted = completedBookings.length;

    // Calculate rating
    const avgRating = completedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / (completedBookings.length || 1);

    // Service distribution
    const serviceDistribution = await this.getServiceDistribution(userId);

    // Earnings chart data
    const earningsData = await this.getEarningsData(userId);

    return {
      totalEarnings,
      jobsCompleted,
      rating: Math.round(avgRating * 10) / 10,
      clients: 45,
      earningsGrowth: '+12%',
      jobsGrowth: '+8%',
      ratingGrowth: '+0.2%',
      clientsGrowth: '+12%',
      responseTime: 5,
      completionRate: 97,
      acceptanceRate: 85,
      satisfaction: 94,
      serviceDistribution,
      earningsData,
    };
  }

  async getAdminAnalytics(params: { period?: string; startDate?: string; endDate?: string }): Promise<any> {
    const { period, startDate, endDate } = params;

    // User stats
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    // Booking stats
    const totalBookings = await this.bookingRepository.count();
    const completedBookings = await this.bookingRepository.count({
      where: { status: BookingStatus.COMPLETED },
    });

    // Revenue stats
    const payments = await this.paymentRepository.find({
      where: { status: PaymentStatus.COMPLETED },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Revenue data for chart
    const revenueData = await this.getRevenueData(period, startDate, endDate);

    // User growth data
    const userGrowthData = await this.getUserGrowthData(period);

    // Platform distribution
    const platformData = await this.getPlatformDistribution();

    // Recent activities
    const recentActivities = await this.getRecentActivities();

    return {
      totalUsers,
      activeUsers,
      totalBookings,
      totalRevenue,
      revenueGrowth: '+18%',
      bookingsGrowth: '+22%',
      usersGrowth: '+15%',
      activeUsersGrowth: '+10%',
      revenueData,
      userGrowthData,
      platformData,
      recentActivities,
    };
  }

  async getUserAnalytics(period?: string): Promise<any> {
    // User growth by role
    const farmers = await this.userRepository.count({ where: { role: UserRole.FARMER } });
    const professionals = await this.userRepository.count({ where: { role: UserRole.PROFESSIONAL } });
    const admins = await this.userRepository.count({ where: { role: UserRole.ADMIN } });

    // Monthly user growth
    const userGrowth = await this.getUserGrowthData(period);

    return {
      total: farmers + professionals + admins,
      farmers,
      professionals,
      admins,
      userGrowth,
    };
  }

  async getBookingAnalytics(params: { period?: string; startDate?: string; endDate?: string }): Promise<any> {
    const { period, startDate, endDate } = params;

    // Booking status distribution
    const statusDistribution = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status, COUNT(booking.id) as count')
      .groupBy('booking.status')
      .getRawMany();

    // Booking trends
    const bookingTrends = await this.getBookingTrends(period, startDate, endDate);

    return {
      statusDistribution,
      bookingTrends,
      averagePrice: 500,
      cancellationRate: 5,
    };
  }

  async getRevenueAnalytics(params: { period?: string; startDate?: string; endDate?: string }): Promise<any> {
    const { period, startDate, endDate } = params;

    // Revenue by payment method
    const revenueByMethod = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.method, SUM(payment.amount) as total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('payment.method')
      .getRawMany();

    // Revenue trends
    const revenueTrends = await this.getRevenueData(period, startDate, endDate);

    return {
      revenueByMethod,
      revenueTrends,
      totalRevenue: revenueTrends.reduce((sum, d) => sum + d.amount, 0),
    };
  }

  async getPerformanceMetrics(): Promise<any> {
    // Platform performance metrics
    return {
      averageResponseTime: 5,
      averageResolutionTime: 120,
      uptime: 99.9,
      errorRate: 0.5,
    };
  }

  async getProfessionalAnalyticsAdmin(period?: string): Promise<any> {
    // Professional performance metrics
    const professionals = await this.userRepository.find({
      where: { role: UserRole.PROFESSIONAL },
    });

    // `totalEarnings` isn't a field on the User entity, so we derive it
    // by aggregating completed bookings across all professionals instead.
    const earningsResult = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('SUM(COALESCE(booking.finalPrice, booking.estimatedPrice, 0))', 'total')
      .where('booking.status = :status', { status: 'completed' })
      .getRawOne<{ total: string | null }>();

    const totalEarnings = Number(earningsResult?.total) || 0;
    const avgRating = professionals.reduce((sum, p) => sum + (p.rating || 0), 0) / (professionals.length || 1);

    return {
      totalProfessionals: professionals.length,
      totalEarnings,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }

  async getGrowthMetrics(period?: string): Promise<any> {
    // User growth
    const userGrowth = await this.getUserGrowthData(period);

    // Revenue growth
    const revenueGrowth = await this.getRevenueGrowth(period);

    // Booking growth
    const bookingGrowth = await this.getBookingGrowth(period);

    return {
      userGrowth,
      revenueGrowth,
      bookingGrowth,
    };
  }

  // Private helper methods
  private async getMonthlySpending(userId: string): Promise<any[]> {
    const payments = await this.paymentRepository.find({
      where: { userId, status: PaymentStatus.COMPLETED },
    });

    const monthlyData: Record<number, number> = {};
    for (const payment of payments) {
      const month = payment.createdAt.getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      label: month,
      value: monthlyData[index] || 0,
    }));
  }

  private async getServiceUsage(userId: string): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      where: { farmerId: userId },
    });

    const usage: Record<string, number> = {};
    for (const booking of bookings) {
      const category = booking.category;
      usage[category] = (usage[category] || 0) + 1;
    }

    const total = Object.values(usage).reduce((sum, val) => sum + val, 0);
    const colors = ['#2E7D32', '#66BB6A', '#FFB300', '#42A5F5', '#AB47BC', '#EF5350'];

    return Object.keys(usage).map((key, index) => ({
      label: key,
      value: total > 0 ? (usage[key] / total) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }

  private async getServiceDistribution(userId: string): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      where: { professionalId: userId },
    });

    const distribution: Record<string, number> = {};
    for (const booking of bookings) {
      const category = booking.category;
      distribution[category] = (distribution[category] || 0) + 1;
    }

    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    const colors = ['#2E7D32', '#66BB6A', '#FFB300', '#42A5F5', '#AB47BC', '#EF5350'];

    return Object.keys(distribution).map((key, index) => ({
      label: key,
      value: total > 0 ? (distribution[key] / total) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }

  private async getEarningsData(userId: string): Promise<any[]> {
    const payments = await this.paymentRepository.find({
      where: { userId, status: PaymentStatus.COMPLETED },
    });

    const monthlyData: Record<number, number> = {};
    for (const payment of payments) {
      const month = payment.createdAt.getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      monthIndex: index,
      amount: monthlyData[index] || 0,
    }));
  }

  private async getRevenueData(period?: string, startDate?: string, endDate?: string): Promise<any[]> {
    const payments = await this.paymentRepository.find({
      where: { status: PaymentStatus.COMPLETED },
    });

    const monthlyData: Record<number, number> = {};
    for (const payment of payments) {
      const month = payment.createdAt.getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      monthIndex: index,
      amount: monthlyData[index] || 0,
    }));
  }

  private async getUserGrowthData(period?: string): Promise<any[]> {
    const users = await this.userRepository.find();

    const monthlyData: Record<number, number> = {};
    for (const user of users) {
      const month = user.createdAt.getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      monthIndex: index,
      value: monthlyData[index] || 0,
    }));
  }

  private async getPlatformDistribution(): Promise<any[]> {
    return [
      { label: 'Web', value: 45, color: '#42A5F5' },
      { label: 'iOS', value: 30, color: '#78909C' },
      { label: 'Android', value: 25, color: '#66BB6A' },
    ];
  }

  private async getBookingTrends(period?: string, startDate?: string, endDate?: string): Promise<any[]> {
    const bookings = await this.bookingRepository.find();
    const monthlyData: Record<number, number> = {};
    for (const booking of bookings) {
      const month = booking.requestedAt.getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      monthIndex: index,
      count: monthlyData[index] || 0,
    }));
  }

  private async getRevenueGrowth(period?: string): Promise<any[]> {
    return this.getRevenueData(period);
  }

  private async getBookingGrowth(period?: string): Promise<any[]> {
    return this.getBookingTrends(period);
  }

  // Merged: this was previously declared twice (once with no params, once
  // with an optional userId), which is an invalid duplicate implementation
  // in TS/JS — there's no real method overloading at runtime here.
  private async getRecentActivities(userId?: string): Promise<any[]> {
    if (userId) {
      return [
        { type: 'booking', title: 'Service booked', time: '2 hours ago', status: 'Completed' },
        { type: 'payment', title: 'Payment made', time: '5 hours ago', status: 'Completed' },
      ];
    }
    return [
      { type: 'booking', title: 'New booking created', time: '2 hours ago', status: 'Completed' },
      { type: 'payment', title: 'Payment processed', time: '5 hours ago', status: 'Completed' },
      { type: 'user', title: 'New user registered', time: '1 day ago', status: 'Active' },
      { type: 'verification', title: 'Professional verified', time: '2 days ago', status: 'Approved' },
    ];
  }
}