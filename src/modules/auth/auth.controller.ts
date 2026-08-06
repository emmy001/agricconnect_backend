// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  // @ApiOperation({ summary: 'User login' })
  // @ApiResponse({ status: 200, description: 'Login successful' })
  // @ApiResponse({ status: 401, description: 'Invalid credentials' })
  // async login(@Body() loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }

  @Post('login')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'User login' })
@ApiResponse({ status: 200, description: 'Login successful' })
@ApiResponse({ status: 401, description: 'Invalid credentials' })
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Post('verify-phone')
  @ApiOperation({ summary: 'Verify phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent' })
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified' })
  async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    return this.authService.verifyOTP(verifyOTPDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Reset link sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Change password' })
@ApiResponse({ status: 200, description: 'Password changed' })
async changePassword(
  @CurrentUser() user: User,
  @Body() changePasswordDto: ChangePasswordDto,
) {
  return this.authService.changePassword(
    user.id,
    changePasswordDto.currentPassword,
    changePasswordDto.newPassword,
  );
}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getCurrentUser(@CurrentUser() user: User) {
    return this.authService.getCurrentUser(user.id);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}