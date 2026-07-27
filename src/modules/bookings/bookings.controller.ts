import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async create(@CurrentUser() user: User, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    return this.bookingsService.findAll(user.id, role, { page, limit, status });
  }

  @Get('farmer')
  @ApiOperation({ summary: 'Get farmer bookings' })
  async getFarmerBookings(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getFarmerBookings(user.id, { page, limit, status });
  }

  @Get('professional')
  @ApiOperation({ summary: 'Get professional bookings' })
  async getProfessionalBookings(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.getProfessionalBookings(user.id, { page, limit, status });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active bookings' })
  async getActiveBookings(@CurrentUser() user: User) {
    return this.bookingsService.getActiveBookings(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.updateStatus(id, status, user.id, user.role);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.cancel(id, reason, user.id);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate booking' })
  async rateBooking(
    @Param('id') id: string,
    @Body() rateBookingDto: RateBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.rateBooking(id, rateBookingDto, user.id);
  }

  @Get('emergency/nearby')
  @ApiOperation({ summary: 'Find nearby professionals for emergency' })
  async findNearbyEmergency(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 10,
  ) {
    return this.bookingsService.findNearbyEmergency(lat, lng, radius);
  }

  @Post('emergency')
  @ApiOperation({ summary: 'Create emergency booking' })
  async createEmergency(@CurrentUser() user: User, @Body() data: any) {
    return this.bookingsService.createEmergency(user.id, data);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get booking tracking info' })
  async getTrackingInfo(@Param('id') id: string) {
    return this.bookingsService.getTrackingInfo(id);
  }

  @Get(':id/eta')
  @ApiOperation({ summary: 'Get booking ETA' })
  async getETA(@Param('id') id: string) {
    return this.bookingsService.getETA(id);
  }
}