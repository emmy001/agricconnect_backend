import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({ page, limit, role, status, search });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateUserStatus(id, status);
  }

  // Professional Verification
  @Get('professionals/pending')
  @ApiOperation({ summary: 'Get pending verifications' })
  async getPendingVerifications() {
    return this.adminService.getPendingVerifications();
  }

  @Get('professionals')
  @ApiOperation({ summary: 'Get all professionals' })
  async getProfessionals(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('verificationStatus') verificationStatus?: string,
  ) {
    return this.adminService.getProfessionals({ page, limit, verificationStatus });
  }

  @Put('professionals/:id/verify')
  @ApiOperation({ summary: 'Verify professional' })
  async verifyProfessional(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return this.adminService.verifyProfessional(id, status, notes);
  }

  // Payout Management
  @Get('payouts/pending')
  @ApiOperation({ summary: 'Get pending payouts' })
  async getPendingPayouts() {
    return this.adminService.getPendingPayouts();
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Get all payouts' })
  async getPayouts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayouts({ page, limit, status });
  }

  @Put('payouts/:id/process')
  @ApiOperation({ summary: 'Process payout' })
  async processPayout(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.processPayout(id, status);
  }

  // Reports
  @Get('reports')
  @ApiOperation({ summary: 'Get reports' })
  async getReports(
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getReports({ type, startDate, endDate });
  }

  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate report' })
  async generateReport(
    @Body('type') type: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.adminService.generateReport(type, startDate, endDate);
  }

  // Fraud Detection
  @Get('fraud/alerts')
  @ApiOperation({ summary: 'Get fraud alerts' })
  async getFraudAlerts() {
    return this.adminService.getFraudAlerts();
  }

  @Put('fraud/alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve fraud alert' })
  async resolveFraudAlert(@Param('id') id: string) {
    return this.adminService.resolveFraudAlert(id);
  }

  @Post('fraud/scan')
  @ApiOperation({ summary: 'Scan for fraud' })
  async scanForFraud() {
    return this.adminService.scanForFraud();
  }

  // CMS
  @Get('cms/pages')
  @ApiOperation({ summary: 'Get CMS pages' })
  async getPages() {
    return this.adminService.getPages();
  }

  @Post('cms/pages')
  @ApiOperation({ summary: 'Create CMS page' })
  async createPage(@Body() data: any) {
    return this.adminService.createPage(data);
  }

  @Put('cms/pages/:id')
  @ApiOperation({ summary: 'Update CMS page' })
  async updatePage(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePage(id, data);
  }

  @Delete('cms/pages/:id')
  @ApiOperation({ summary: 'Delete CMS page' })
  async deletePage(@Param('id') id: string) {
    return this.adminService.deletePage(id);
  }

  // Promotions
  @Get('promotions')
  @ApiOperation({ summary: 'Get promotions' })
  async getPromotions() {
    return this.adminService.getPromotions();
  }

  @Post('promotions')
  @ApiOperation({ summary: 'Create promotion' })
  async createPromotion(@Body() data: any) {
    return this.adminService.createPromotion(data);
  }

  @Put('promotions/:id')
  @ApiOperation({ summary: 'Update promotion' })
  async updatePromotion(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePromotion(id, data);
  }

  @Delete('promotions/:id')
  @ApiOperation({ summary: 'Delete promotion' })
  async deletePromotion(@Param('id') id: string) {
    return this.adminService.deletePromotion(id);
  }

  // Customer Support
  @Get('support/tickets')
  @ApiOperation({ summary: 'Get support tickets' })
  async getSupportTickets(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSupportTickets({ page, limit, status });
  }

  @Put('support/tickets/:id/resolve')
  @ApiOperation({ summary: 'Resolve support ticket' })
  async resolveTicket(@Param('id') id: string) {
    return this.adminService.resolveTicket(id);
  }

  @Get('support/chats')
  @ApiOperation({ summary: 'Get support chats' })
  async getSupportChats() {
    return this.adminService.getSupportChats();
  }
}