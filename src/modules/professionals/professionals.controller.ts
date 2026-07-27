import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('professionals')
@Controller('professionals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create professional profile' })
  @ApiResponse({ status: 201, description: 'Professional created' })
  async create(@CurrentUser() user: User, @Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.create(user.id, createProfessionalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all professionals' })
  @ApiResponse({ status: 200, description: 'List of professionals' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('specialty') specialty?: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('minRating') minRating?: number,
  ) {
    return this.professionalsService.findAll({
      page,
      limit,
      specialty,
      lat,
      lng,
      radius,
      isAvailable,
      minRating,
    });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby professionals' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 10,
    @Query('specialty') specialty?: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.professionalsService.findNearby(lat, lng, radius, specialty, limit);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current professional profile' })
  async findMyProfile(@CurrentUser() user: User) {
    return this.professionalsService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get professional by ID' })
  async findOne(@Param('id') id: string) {
    return this.professionalsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update professional' })
  async update(@Param('id') id: string, @Body() updateProfessionalDto: UpdateProfessionalDto) {
    return this.professionalsService.update(id, updateProfessionalDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete professional (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.professionalsService.delete(id);
  }

  @Post(':id/verify')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Verify professional (Admin only)' })
  async verifyProfessional(@Param('id') id: string, @Body('status') status: string) {
    return this.professionalsService.verify(id, status);
  }

  @Post(':id/availability')
  @ApiOperation({ summary: 'Toggle availability' })
  async toggleAvailability(@Param('id') id: string, @Body('isAvailable') isAvailable: boolean) {
    return this.professionalsService.toggleAvailability(id, isAvailable);
  }

  @Post(':id/location')
  @ApiOperation({ summary: 'Update location' })
  async updateLocation(
    @Param('id') id: string,
    @Body() location: { latitude: number; longitude: number; address?: string },
  ) {
    return this.professionalsService.updateLocation(id, location);
  }

  @Post(':id/working-hours')
  @ApiOperation({ summary: 'Set working hours' })
  async setWorkingHours(@Param('id') id: string, @Body() workingHours: any[]) {
    return this.professionalsService.setWorkingHours(id, workingHours);
  }

  @Post(':id/certifications')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload certifications' })
  async uploadCertifications(
    @Param('id') id: string,
    @Body() certifications: any[],
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.professionalsService.uploadCertifications(id, certifications, files);
  }

  @Post(':id/portfolio')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload portfolio items' })
  async uploadPortfolio(
    @Param('id') id: string,
    @Body() portfolio: any[],
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.professionalsService.uploadPortfolio(id, portfolio, files);
  }

  @Get(':id/earnings')
  @ApiOperation({ summary: 'Get professional earnings' })
  async getEarnings(
    @Param('id') id: string,
    @Query('period') period?: string,
  ) {
    return this.professionalsService.getEarnings(id, period);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get professional performance metrics' })
  async getPerformance(@Param('id') id: string) {
    return this.professionalsService.getPerformance(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get professional reviews' })
  async getReviews(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.professionalsService.getReviews(id, page, limit);
  }

  @Get(':id/calendar')
  @ApiOperation({ summary: 'Get professional calendar' })
  async getCalendar(
    @Param('id') id: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.professionalsService.getCalendar(id, year, month);
  }
}