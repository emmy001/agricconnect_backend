import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Cooperative } from './entities/cooperative.entity';
import { CooperativeMember, MemberRole } from './entities/cooperative-member.entity';
import { CooperativeService as CooperativeServiceEntity } from './entities/cooperative-service.entity';
import { GroupBooking, GroupBookingStatus } from './entities/group-booking.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

interface CreateCooperativeData {
  name: string;
  description: string;
  logo?: string;
  category: string;
  location: string;
  discount?: number;
  settings?: {
    requiresApproval: boolean;
    maxMembers: number;
    subscriptionFee: number;
  };
  metadata?: Record<string, any>;
}

interface AddServiceData {
  name: string;
  description?: string;
  price: number;
  discount: number;
  icon?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

interface CreateGroupBookingData {
  serviceIds: string[];
  memberCount?: number;
  scheduledDate: Date;
}

@Injectable()
export class CooperativeService {
  constructor(
    @InjectRepository(Cooperative)
    private cooperativeRepository: Repository<Cooperative>,
    @InjectRepository(CooperativeMember)
    private memberRepository: Repository<CooperativeMember>,
    @InjectRepository(CooperativeServiceEntity)
    private serviceRepository: Repository<CooperativeServiceEntity>,
    @InjectRepository(GroupBooking)
    private bookingRepository: Repository<GroupBooking>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, data: CreateCooperativeData): Promise<Cooperative> {
    const payload: DeepPartial<Cooperative> = {
      ...data,
      totalSavings: 0,
    };
    const cooperative = this.cooperativeRepository.create(payload);
    const saved = await this.cooperativeRepository.save(cooperative);

    // Add creator as chairman
    // NOTE: 'chairman' is a placeholder — swap for the real MemberRole enum
    // member (e.g. MemberRole.CHAIRMAN) once you confirm its exact name in
    // cooperative-member.entity.ts. A bare string literal won't satisfy the
    // MemberRole type the entity declares for `role`.
    const memberPayload: DeepPartial<CooperativeMember> = {
      cooperativeId: saved.id,
      userId,
      role: MemberRole.CHAIRMAN,
      joinedAt: new Date(),
    };
    const member = this.memberRepository.create(memberPayload);
    await this.memberRepository.save(member);

    return saved;
  }

  async findAll(page: number, limit: number): Promise<{ data: Cooperative[]; total: number }> {
    const [data, total] = await this.cooperativeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findMy(userId: string): Promise<Cooperative[]> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: ['cooperative'],
    });
    return members.map(m => m.cooperative);
  }

  async findOne(id: string): Promise<Cooperative> {
    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'services'],
    });
    if (!cooperative) {
      throw new NotFoundException('Cooperative not found');
    }
    return cooperative;
  }

  async update(id: string, data: Partial<Cooperative>): Promise<Cooperative> {
    const cooperative = await this.findOne(id);
    Object.assign(cooperative, data);
    return this.cooperativeRepository.save(cooperative);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.cooperativeRepository.softDelete(id);
    return { success: true };
  }

  async join(userId: string, cooperativeId: string): Promise<{ success: boolean }> {
    const cooperative = await this.findOne(cooperativeId);

    const existing = await this.memberRepository.findOne({
      where: { cooperativeId, userId },
    });
    if (existing) {
      throw new BadRequestException('Already a member');
    }

    const member = this.memberRepository.create({
      cooperativeId,
      userId,
      joinedAt: new Date(),
    });
    await this.memberRepository.save(member);

    cooperative.memberCount += 1;
    await this.cooperativeRepository.save(cooperative);

    return { success: true };
  }

  async leave(userId: string, cooperativeId: string): Promise<{ success: boolean }> {
    const member = await this.memberRepository.findOne({
      where: { cooperativeId, userId },
    });
    if (!member) {
      throw new NotFoundException('Not a member');
    }

    await this.memberRepository.delete(member.id);

    const cooperative = await this.findOne(cooperativeId);
    cooperative.memberCount -= 1;
    await this.cooperativeRepository.save(cooperative);

    return { success: true };
  }

  async getMembers(cooperativeId: string): Promise<CooperativeMember[]> {
    await this.findOne(cooperativeId);
    return this.memberRepository.find({
      where: { cooperativeId },
      relations: ['user'],
    });
  }

  async addService(cooperativeId: string, data: AddServiceData): Promise<CooperativeServiceEntity> {
    await this.findOne(cooperativeId);
    const payload: DeepPartial<CooperativeServiceEntity> = {
      cooperativeId,
      ...data,
    };
    const service = this.serviceRepository.create(payload);
    return this.serviceRepository.save(service);
  }

  async getServices(cooperativeId: string): Promise<CooperativeServiceEntity[]> {
    await this.findOne(cooperativeId);
    return this.serviceRepository.find({
      where: { cooperativeId, isActive: true },
    });
  }

  async createGroupBooking(userId: string, cooperativeId: string, data: CreateGroupBookingData): Promise<GroupBooking> {
    const cooperative = await this.findOne(cooperativeId);
    const member = await this.memberRepository.findOne({
      where: { cooperativeId, userId },
    });
    if (!member) {
      throw new BadRequestException('Must be a member to create group booking');
    }

    // Calculate totals
    // TypeORM's `find()` uses its own FindOperator helpers (In, Like, etc.)
    // rather than Mongo-style query objects like `{ $in: [...] }`.
    const services = await this.serviceRepository.find({
      where: { cooperativeId, id: In(data.serviceIds) },
    });

    let totalAmount = 0;
    for (const service of services) {
      totalAmount += Number(service.price);
    }

    const discountAmount = totalAmount * (Number(cooperative.discount) / 100);
    const finalAmount = totalAmount - discountAmount;

    const booking = this.bookingRepository.create({
      cooperativeId,
      userId,
      serviceIds: data.serviceIds,
      memberCount: data.memberCount || 1,
      totalAmount,
      discountAmount,
      finalAmount,
      scheduledDate: data.scheduledDate,
      status: GroupBookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async getGroupBookings(cooperativeId: string): Promise<GroupBooking[]> {
    await this.findOne(cooperativeId);
    return this.bookingRepository.find({
      where: { cooperativeId },
      order: { createdAt: 'DESC' },
    });
  }

  async contribute(userId: string, cooperativeId: string, amount: number): Promise<{ success: boolean }> {
    const cooperative = await this.findOne(cooperativeId);
    const member = await this.memberRepository.findOne({
      where: { cooperativeId, userId },
    });
    if (!member) {
      throw new BadRequestException('Must be a member to contribute');
    }

    // Add to cooperative savings
    cooperative.totalSavings = Number(cooperative.totalSavings) + amount;
    await this.cooperativeRepository.save(cooperative);

    // Update member contributions
    member.contributions += amount;
    await this.memberRepository.save(member);

    return { success: true };
  }

  async getSavings(cooperativeId: string): Promise<{ totalSavings: number }> {
    const cooperative = await this.findOne(cooperativeId);
    return { totalSavings: cooperative.totalSavings };
  }
}