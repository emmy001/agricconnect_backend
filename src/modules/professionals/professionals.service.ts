import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Professional, ProfessionalStatus } from './entities/professional.entity';
import { Certification } from './entities/certification.entity';
import { WorkingHour } from './entities/working-hour.entity';
import { Portfolio, PortfolioType } from './entities/portfolio.entity';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
    @InjectRepository(WorkingHour)
    private workingHourRepository: Repository<WorkingHour>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createProfessionalDto: CreateProfessionalDto): Promise<Professional> {
    // Check if user exists
    await this.usersService.findById(userId);

    // Check if professional already exists
    const existing = await this.professionalRepository.findOne({ where: { userId } });
    if (existing) {
      throw new BadRequestException('Professional profile already exists');
    }

    const professional = this.professionalRepository.create({
      userId,
      ...createProfessionalDto,
      verificationStatus: ProfessionalStatus.PENDING,
    });

    return this.professionalRepository.save(professional);
  }

  async findAll(params: {
    page: number;
    limit: number;
    specialty?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    isAvailable?: boolean;
    minRating?: number;
  }): Promise<{ data: Professional[]; total: number }> {
    const { page, limit, specialty, lat, lng, radius, isAvailable, minRating } = params;
    const queryBuilder = this.professionalRepository.createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .leftJoinAndSelect('professional.certifications', 'certifications')
      .where('professional.verificationStatus = :status', { status: ProfessionalStatus.APPROVED });

    if (specialty) {
      queryBuilder.andWhere('professional.specialty ILIKE :specialty', { specialty: `%${specialty}%` });
    }

    if (isAvailable !== undefined) {
      queryBuilder.andWhere('professional.isAvailable = :isAvailable', { isAvailable });
    }

    if (minRating) {
      queryBuilder.andWhere('user.rating >= :minRating', { minRating });
    }

    // Distance calculation for nearby professionals
    if (lat && lng && radius) {
      const earthRadius = 6371;
      queryBuilder
        .addSelect(
          `(${earthRadius} * acos(cos(radians(:lat)) * cos(radians(CAST(professional.location->>'latitude' AS float))) * cos(radians(CAST(professional.location->>'longitude' AS float)) - radians(:lng)) + sin(radians(:lat)) * sin(radians(CAST(professional.location->>'latitude' AS float)))))`,
          'distance',
        )
        .having('distance <= :radius', { radius })
        .orderBy('distance', 'ASC')
        .setParameters({ lat, lng, radius });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findNearby(lat: number, lng: number, radius: number = 10, specialty?: string, limit: number = 20): Promise<Professional[]> {
    const queryBuilder = this.professionalRepository.createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.verificationStatus = :status', { status: ProfessionalStatus.APPROVED })
      .andWhere('professional.isAvailable = true');

    if (specialty) {
      queryBuilder.andWhere('professional.specialty ILIKE :specialty', { specialty: `%${specialty}%` });
    }

    const earthRadius = 6371;
    queryBuilder
      .addSelect(
        `(${earthRadius} * acos(cos(radians(:lat)) * cos(radians(CAST(professional.location->>'latitude' AS float))) * cos(radians(CAST(professional.location->>'longitude' AS float)) - radians(:lng)) + sin(radians(:lat)) * sin(radians(CAST(professional.location->>'latitude' AS float)))))`,
        'distance',
      )
      .having('distance <= :radius', { radius })
      .orderBy('distance', 'ASC')
      .setParameters({ lat, lng, radius })
      .limit(limit);

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { id },
      relations: ['user', 'certifications', 'workingHours', 'portfolio'],
    });
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }
    return professional;
  }

  async findByUserId(userId: string): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { userId },
      relations: ['user', 'certifications', 'workingHours', 'portfolio'],
    });
    if (!professional) {
      throw new NotFoundException('Professional profile not found');
    }
    return professional;
  }

  async update(id: string, updateProfessionalDto: UpdateProfessionalDto): Promise<Professional> {
    const professional = await this.findById(id);
    Object.assign(professional, updateProfessionalDto);
    return this.professionalRepository.save(professional);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const professional = await this.findById(id);
    await this.professionalRepository.softDelete(id);
    return { success: true };
  }

  async verify(id: string, status: string): Promise<Professional> {
    const professional = await this.findById(id);
    professional.verificationStatus = status as ProfessionalStatus;
    professional.verifiedAt = new Date();
    return this.professionalRepository.save(professional);
  }

  async toggleAvailability(id: string, isAvailable: boolean): Promise<Professional> {
    const professional = await this.findById(id);
    professional.isAvailable = isAvailable;
    return this.professionalRepository.save(professional);
  }

  // async updateLocation(id: string, location: { latitude: number; longitude: number; address?: string }): Promise<Professional> {
  //   const professional = await this.findById(id);
  //   professional.location = location;
  //   return this.professionalRepository.save(professional);
  // }

  async updateLocation(id: string, location: { latitude: number; longitude: number; address?: string }): Promise<Professional> {
  const professional = await this.findById(id);
  professional.location = {
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address ?? '',
  };
  return this.professionalRepository.save(professional);
}

  async setWorkingHours(id: string, workingHours: any[]): Promise<Professional> {
    const professional = await this.findById(id);
    
    // Remove existing working hours
    await this.workingHourRepository.delete({ professionalId: id });
    
    // Create new working hours
    const newHours = workingHours.map(hour => 
      this.workingHourRepository.create({
        professionalId: id,
        day: hour.day,
        isWorking: hour.isWorking,
        startTime: hour.startTime,
        endTime: hour.endTime,
      })
    );
    
    await this.workingHourRepository.save(newHours);
    
    return this.findById(id);
  }

  async uploadCertifications(id: string, certifications: any[], files: Express.Multer.File[]): Promise<Professional> {
    const professional = await this.findById(id);
    
    const newCertifications = certifications.map((cert, index) => {
      const file = files[index];
      return this.certificationRepository.create({
        professionalId: id,
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year,
        certificateUrl: file ? `/uploads/${file.filename}` : null,
      });
    });
    
    await this.certificationRepository.save(newCertifications);
    return this.findById(id);
  }

  async uploadPortfolio(id: string, portfolio: any[], files: Express.Multer.File[]): Promise<Professional> {
    const professional = await this.findById(id);
    
    const newPortfolio = portfolio.map((item, index) => {
      const file = files[index];
      return this.portfolioRepository.create({
        professionalId: id,
        title: item.title,
        description: item.description,
        type: item.type as PortfolioType,
        url: file ? `/uploads/${file.filename}` : item.url,
        thumbnailUrl: item.thumbnailUrl,
        order: item.order || 0,
      });
    });
    
    await this.portfolioRepository.save(newPortfolio);
    return this.findById(id);
  }

  async getEarnings(id: string, period?: string): Promise<any> {
    // Todo:Implementation depends on bookings and payments
    return {
      today: 2500,
      week: 12500,
      month: 45000,
      total: 180000,
    };
  }

  async getPerformance(id: string): Promise<any> {
    const professional = await this.findById(id);
    return {
      responseTime: professional.responseTime,
      completionRate: professional.completionRate,
      acceptanceRate: professional.acceptanceRate,
      jobsCompleted: professional.jobsCompleted,
      rating: professional.user?.rating || 0,
      totalReviews: professional.user?.totalReviews || 0,
    };
  }

  async getReviews(id: string, page: number, limit: number): Promise<any> {
    // Implementation depends on reviews table
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }

  async getCalendar(id: string, year: number, month: number): Promise<any> {
    // Implementation depends on bookings
    return {
      events: [],
    };
  }
}