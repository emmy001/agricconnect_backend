// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { CacheService } from '../../shared/services/cache.service';
import { EmailService } from '../../shared/services/email.service';
import { SMSService } from '../../shared/services/sms.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cacheService: CacheService,
    private emailService: EmailService,
    private smsService: SMSService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'status', 'isVerified', 'phoneNumber', 'profileImage'],
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('Account is pending verification');
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Send login notification
    await this.notificationsService.create({
      userId: user.id,
      title: 'New Login',
      body: `New login to your account from ${loginDto.userAgent || 'Unknown device'}`,
      type: 'system' as any,
      priority: 'medium' as any,
      data: { 
        loginTime: new Date().toISOString(),
        userAgent: loginDto.userAgent,
        ip: loginDto.ip,
      },
    });

    return this.generateAuthResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { phoneNumber: registerDto.phoneNumber },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      phoneNumber: registerDto.phoneNumber,
      password: hashedPassword,
      role: registerDto.role || UserRole.FARMER,
      status: UserStatus.ACTIVE,
      isVerified: false,
    });

    await this.userRepository.save(user);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.email || 'Farmer',
        `${this.configService.get('APP_URL')}/dashboard`,
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    // Send welcome notification
    try {
      await this.notificationsService.create({
        userId: user.id,
        title: 'Welcome to AgriConnect!',
        body: 'Welcome to the community! Explore services, connect with professionals, and grow your farm.',
        type: 'system' as any,
        priority: 'high' as any,
        data: { 
          action: 'explore',
          actionUrl: '/home',
        },
      });
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
    }

    return this.generateAuthResponse(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      success: true,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: parseInt(this.configService.get('JWT_EXPIRATION', '900')),
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    try {
      // Blacklist the current token in Redis
      // await this.cacheService.set(`blacklist:${token}`, true, 3600);
      
      // Send logout notification
      await this.notificationsService.create({
        userId,
        title: 'Logged Out',
        body: 'You have been successfully logged out.',
        type: 'system' as any,
        priority: 'low' as any,
        data: { logoutTime: new Date().toISOString() },
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true };
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<{ success: boolean; verificationId: string }> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const verificationId = crypto.randomUUID();

    // Store OTP in Redis with 5 minutes expiry
    await this.cacheService.set(`otp:${verificationId}`, otp, 300);

    // Send SMS using your SMS gateway
    try {
      await this.smsService.sendOTP(verifyPhoneDto.phoneNumber, otp);
    } catch (error) {
      console.error('Failed to send OTP SMS:', error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    return {
      success: true,
      verificationId,
    };
  }

  async verifyOTP(verifyOTPDto: VerifyOTPDto): Promise<AuthResponseDto> {
    // Validate OTP from Redis
    const storedOtp = await this.cacheService.get<string>(`otp:${verifyOTPDto.verificationId}`);
    if (!storedOtp || storedOtp !== verifyOTPDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Delete OTP from cache after verification
    await this.cacheService.delete(`otp:${verifyOTPDto.verificationId}`);

    // Find user by phone number
    const user = await this.userRepository.findOne({ 
      where: { phoneNumber: verifyOTPDto.phoneNumber } 
    });

    if (!user) {
      // Create new user with phone number
      const newUser = this.userRepository.create({
        phoneNumber: verifyOTPDto.phoneNumber,
        email: `${verifyOTPDto.phoneNumber}@temp.agriconnect.com`,
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
        
        role: UserRole.FARMER,
        status: UserStatus.ACTIVE,
        isVerified: true,
      });
      await this.userRepository.save(newUser);
      
      // Send welcome notification
      await this.notificationsService.create({
        userId: newUser.id,
        title: 'Welcome to AgriConnect!',
        body: 'Your account has been created. Complete your profile to get started.',
        type: 'system' as any,
        priority: 'high' as any,
        data: { action: 'complete_profile' },
      });

      return this.generateAuthResponse(newUser);
    }

    // Mark user as verified
    user.isVerified = true;
    await this.userRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ 
      where: { email: forgotPasswordDto.email } 
    });
    
    if (!user) {
      // For security, don't reveal if email exists
      return { success: true };
    }

    const resetToken = crypto.randomUUID();
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`;

    // Store in Redis with 1 hour expiry
    await this.cacheService.set(`reset:${resetToken}`, user.id, 3600);

    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.email || 'User',
        resetUrl,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException('Failed to send reset email. Please try again.');
    }

    // Send notification
    await this.notificationsService.create({
      userId: user.id,
      title: 'Password Reset Requested',
      body: 'A password reset was requested for your account. Check your email for instructions.',
      type: 'system' as any,
      priority: 'high' as any,
      data: { action: 'reset_password' },
    });

    return { success: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ success: boolean }> {
    const userId = await this.cacheService.get<string>(`reset:${resetPasswordDto.token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(resetPasswordDto.newPassword, salt);
    await this.userRepository.save(user);

    // Delete token from cache
    await this.cacheService.delete(`reset:${resetPasswordDto.token}`);

    // Send success notification
    await this.notificationsService.create({
      userId: user.id,
      title: 'Password Reset Successful',
      body: 'Your password has been reset successfully.',
      type: 'system' as any,
      priority: 'high' as any,
      data: { action: 'password_reset_complete' },
    });

    return { success: true };
  }

  async oauthLogin(oauthLoginDto: OAuthLoginDto): Promise<AuthResponseDto> {
    // Handle OAuth login (Google, Apple, etc.)
    // This would verify the token with the provider and find/create user
    try {
      // For Google OAuth
      if (oauthLoginDto.provider === 'google') {
        // Verify Google token and get user info
        // const userInfo = await this.verifyGoogleToken(oauthLoginDto.token);
        // Then find or create user
      }
      
      // For Apple OAuth
      if (oauthLoginDto.provider === 'apple') {
        // Verify Apple token and get user info
        // const userInfo = await this.verifyAppleToken(oauthLoginDto.token);
        // Then find or create user
      }

      // For now, throw not implemented
      throw new BadRequestException('OAuth login not implemented yet');
    } catch (error) {
      throw new UnauthorizedException('Invalid OAuth token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    // Send notification
    await this.notificationsService.create({
      userId: user.id,
      title: 'Password Changed',
      body: 'Your password has been changed successfully.',
      type: 'system' as any,
      priority: 'high' as any,
      data: { action: 'password_changed' },
    });

    return { success: true };
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal if email exists
      return { success: true };
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const verificationUrl = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;

    // Store in Redis
    await this.cacheService.set(`verify:${verificationToken}`, user.id, 86400); // 24 hours

    // Send verification email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.email || 'User',
        verificationUrl,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return { success: true };
  }

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    const userId = await this.cacheService.get<string>(`verify:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    // Delete token from cache
    await this.cacheService.delete(`verify:${token}`);

    // Send notification
    await this.notificationsService.create({
      userId: user.id,
      title: 'Email Verified',
      body: 'Your email has been verified successfully.',
      type: 'system' as any,
      priority: 'high' as any,
      data: { action: 'email_verified' },
    });

    return { success: true };
  }
}