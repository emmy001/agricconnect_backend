import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@CurrentUser() user: User) {
    return this.walletService.getBalance(user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  async getTransactions(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.walletService.getTransactions(user.id, { page, limit, type, status });
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async getTransaction(@Param('id') id: string) {
    return this.walletService.getTransaction(id);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds' })
  async deposit(@CurrentUser() user: User, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(user.id, depositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw funds' })
  async withdraw(@CurrentUser() user: User, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(user.id, withdrawDto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds to another user' })
  async transfer(@CurrentUser() user: User, @Body() transferDto: TransferDto) {
    return this.walletService.transfer(user.id, transferDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get wallet stats' })
  async getStats(@CurrentUser() user: User) {
    return this.walletService.getStats(user.id);
  }

  @Get('referral')
  @ApiOperation({ summary: 'Get referral info' })
  async getReferralInfo(@CurrentUser() user: User) {
    return this.walletService.getReferralInfo(user.id);
  }

  @Post('referral/generate')
  @ApiOperation({ summary: 'Generate referral code' })
  async generateReferralCode(@CurrentUser() user: User) {
    return this.walletService.generateReferralCode(user.id);
  }

  @Post('referral/claim')
  @ApiOperation({ summary: 'Claim referral bonus' })
  async claimReferralBonus(@CurrentUser() user: User, @Body('code') code: string) {
    return this.walletService.claimReferralBonus(user.id, code);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Get user coupons' })
  async getCoupons(@CurrentUser() user: User, @Query('active') active?: boolean) {
    return this.walletService.getCoupons(user.id, active);
  }

  @Post('coupons/apply')
  @ApiOperation({ summary: 'Apply coupon' })
  async applyCoupon(@CurrentUser() user: User, @Body('code') code: string) {
    return this.walletService.applyCoupon(user.id, code);
  }
}