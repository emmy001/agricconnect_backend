import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize payment' })
  async initializePayment(@CurrentUser() user: User, @Body() initializePaymentDto: InitializePaymentDto) {
    return this.paymentsService.initializePayment(user.id, initializePaymentDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment' })
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto);
  }

  @Post('mpesa/callback')
  @ApiOperation({ summary: 'M-Pesa callback' })
  async mpesaCallback(@Body() callbackData: any) {
    return this.paymentsService.handleMpesaCallback(callbackData);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook' })
  async stripeWebhook(@Body() event: any) {
    return this.paymentsService.handleStripeWebhook(event);
  }

  @Get()
  @ApiOperation({ summary: 'Get user payments' })
  async getPayments(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.getUserPayments(user.id, { page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.refundPayment(id, refundPaymentDto, user.id);
  }

  @Get('escrow/:id')
  @ApiOperation({ summary: 'Get escrow details' })
  async getEscrow(@Param('id') id: string) {
    return this.paymentsService.getEscrow(id);
  }

  @Post('escrow/:id/release')
  @ApiOperation({ summary: 'Release escrow' })
  async releaseEscrow(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.releaseEscrow(id, user.id);
  }

  @Post('escrow/:id/dispute')
  @ApiOperation({ summary: 'Dispute escrow' })
  async disputeEscrow(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.disputeEscrow(id, reason, user.id);
  }

  @Post('escrow/:id/resolve')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Resolve escrow dispute (Admin only)' })
  async resolveEscrow(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ) {
    return this.paymentsService.resolveEscrow(id, resolution);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment stats' })
  async getPaymentStats(@CurrentUser() user: User) {
    return this.paymentsService.getPaymentStats(user.id);
  }
}