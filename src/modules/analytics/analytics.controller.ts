import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('farmer')
  @ApiOperation({ summary: 'Get farmer analytics' })
  async getFarmerAnalytics(@CurrentUser() user: User) {
    return this.analyticsService.getFarmerAnalytics(user.id);
  }

  @Get('professional')
  @ApiOperation({ summary: 'Get professional analytics' })
  async getProfessionalAnalytics(@CurrentUser() user: User) {
    return this.analyticsService.getProfessionalAnalytics(user.id);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get admin analytics' })
  async getAdminAnalytics(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAdminAnalytics({ period, startDate, endDate });
  }

  @Get('admin/users')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get user analytics' })
  async getUserAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getUserAnalytics(period);
  }

  @Get('admin/bookings')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get booking analytics' })
  async getBookingAnalytics(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getBookingAnalytics({ period, startDate, endDate });
  }

  @Get('admin/revenue')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenueAnalytics(
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueAnalytics({ period, startDate, endDate });
  }

  @Get('admin/performance')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get platform performance metrics' })
  async getPerformanceMetrics() {
    return this.analyticsService.getPerformanceMetrics();
  }

  @Get('admin/professionals')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get professional analytics' })
  async getProfessionalAnalyticsAdmin(@Query('period') period?: string) {
    return this.analyticsService.getProfessionalAnalyticsAdmin(period);
  }

  @Get('admin/growth')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get growth metrics' })
  async getGrowthMetrics(@Query('period') period?: string) {
    return this.analyticsService.getGrowthMetrics(period);
  }
}