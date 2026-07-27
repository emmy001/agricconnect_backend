import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { ProfessionalsService } from '../professionals/professionals.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private professionalsService: ProfessionalsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async create(farmerId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    // Verify farmer exists
    await this.usersService.findById(farmerId);

    // If professional specified, verify they exist and are available
    if (createBookingDto.professionalId) {
      const professional = await this.professionalsService.findById(createBookingDto.professionalId);
      if (!professional.isAvailable) {
        throw new BadRequestException('Professional is not available');
      }
    }

    const booking = this.bookingRepository.create({
      farmerId,
      ...createBookingDto,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Send notifications
    await this.notificationsService.sendBookingCreated(savedBooking);

    // If no professional specified, start matching
    if (!createBookingDto.professionalId) {
      this.matchBooking(savedBooking);
    }

    return savedBooking;
  }

  async findAll(userId: string, role: string, params: { page: number; limit: number; status?: string }): Promise<{ data: Booking[]; total: number }> {
    const { page, limit, status } = params;
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.farmer', 'farmer')
      .leftJoinAndSelect('booking.professional', 'professional')
      .leftJoinAndSelect('professional.user', 'professionalUser');

    if (role === 'farmer') {
      queryBuilder.where('booking.farmerId = :userId', { userId });
    } else if (role === 'professional') {
      queryBuilder.where('booking.professionalId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.requestedAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async getFarmerBookings(farmerId: string, params: { page: number; limit: number; status?: string }): Promise<{ data: Booking[]; total: number }> {
    return this.findAll(farmerId, 'farmer', params);
  }

  async getProfessionalBookings(professionalId: string, params: { page: number; limit: number; status?: string }): Promise<{ data: Booking[]; total: number }> {
    return this.findAll(professionalId, 'professional', params);
  }

  async getActiveBookings(userId: string): Promise<Booking[]> {
    const statuses = [BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS];
    return this.bookingRepository.find({
      where: [
        { farmerId: userId, status: statuses[0] as any },
        { farmerId: userId, status: statuses[1] as any },
        { farmerId: userId, status: statuses[2] as any },
        { farmerId: userId, status: statuses[3] as any },
      ],
      relations: ['farmer', 'professional', 'professional.user'],
      order: { requestedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['farmer', 'professional', 'professional.user'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findById(id);
    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async updateStatus(id: string, status: string, userId: string, role: string): Promise<Booking> {
    const booking = await this.findById(id);
    
    // Check permissions
    if (role === 'farmer' && booking.farmerId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }
    if (role === 'professional' && booking.professionalId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Validate status transition
    const validTransitions = {
      [BookingStatus.PENDING]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
      [BookingStatus.ACCEPTED]: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED],
      [BookingStatus.EN_ROUTE]: [BookingStatus.ARRIVED, BookingStatus.CANCELLED],
      [BookingStatus.ARRIVED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    };

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(status as BookingStatus)) {
      throw new BadRequestException(`Invalid status transition from ${booking.status} to ${status}`);
    }

    booking.status = status as BookingStatus;
    if (status === BookingStatus.COMPLETED) {
      booking.completedAt = new Date();
    }

    const updated = await this.bookingRepository.save(booking);

    // Send notifications
    await this.notificationsService.sendBookingStatusUpdate(updated);

    return updated;
  }

  async cancel(id: string, reason: string, userId: string): Promise<Booking> {
    const booking = await this.findById(id);
    
    if (booking.farmerId !== userId && booking.professionalId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel completed or already cancelled booking');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.metadata = {
      ...booking.metadata,
      cancellationReason: reason,
      cancelledBy: userId,
      cancelledAt: new Date(),
    };

    const cancelled = await this.bookingRepository.save(booking);

    // Send notifications
    await this.notificationsService.sendBookingCancelled(cancelled);

    return cancelled;
  }

  async rateBooking(id: string, rateBookingDto: RateBookingDto, userId: string): Promise<Booking> {
    const booking = await this.findById(id);
    
    if (booking.farmerId !== userId) {
      throw new ForbiddenException('Only the farmer can rate the booking');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking must be completed before rating');
    }

    if (booking.rating) {
      throw new BadRequestException('Booking already rated');
    }

    booking.rating = rateBookingDto.rating;
    booking.review = rateBookingDto.review;
    booking.metadata = {
      ...booking.metadata,
      reviewImages: rateBookingDto.reviewImages,
    };

    const rated = await this.bookingRepository.save(booking);

    // Update professional rating
    await this.usersService.updateRating(booking.professionalId);

    return rated;
  }

  async matchBooking(booking: Booking): Promise<void> {
    // Smart matching algorithm
    const professionals = await this.professionalsService.findNearby(
      booking.pickupLocation.latitude,
      booking.pickupLocation.longitude,
      10, // 10km radius
      booking.category,
      10, // Top 10
    );

    // Send notifications to top 10 professionals
    for (const professional of professionals) {
      await this.notificationsService.sendBookingRequest(professional.userId, booking);
    }

    // Auto-assign after timeout if not accepted
    // Implementation would use Bull queue for delayed job
  }

  async findNearbyEmergency(lat: number, lng: number, radius: number = 10): Promise<any> {
    return this.professionalsService.findNearby(lat, lng, radius, undefined, 10);
  }

  async createEmergency(farmerId: string, data: any): Promise<Booking> {
    const booking = await this.create(farmerId, {
      ...data,
      isEmergency: true,
      estimatedPrice: data.estimatedPrice || 0,
      distance: data.distance || 0,
    });

    // Notify all nearby professionals
    // Implementation would send high-priority notifications

    return booking;
  }

  async getTrackingInfo(id: string): Promise<any> {
    const booking = await this.findById(id);
    return {
      status: booking.status,
      pickup: booking.pickupLocation,
      dropoff: booking.dropoffLocation,
      professionalLocation: booking.professional?.location || null,
      distance: booking.distance,
      eta: this.calculateETA(booking),
    };
  }

  async getETA(id: string): Promise<any> {
    const booking = await this.findById(id);
    return {
      eta: this.calculateETA(booking),
      distance: booking.distance,
    };
  }

  private calculateETA(booking: Booking): number {
    // Simple ETA calculation based on distance and average speed
    const averageSpeed = 40; // km/h
    const distance = booking.distance;
    const estimatedTime = (distance / averageSpeed) * 60; // minutes
    return Math.round(estimatedTime);
  }
}