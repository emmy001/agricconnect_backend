import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'status', 'isVerified'],
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

    return this.generateAuthResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: registerDto.email }, { phoneNumber: registerDto.phoneNumber }],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      phoneNumber: registerDto.phoneNumber,
      role: registerDto.role || UserRole.FARMER,
      status: UserStatus.ACTIVE,
      isVerified: false,
    });

    await this.userRepository.save(user);

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
    // Implement token blacklist with Redis
    return { success: true };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async verifyPhone(phoneNumber: string): Promise<{ success: boolean; verificationId: string }> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const verificationId = crypto.randomUUID();

    // Store OTP in Redis with 5 minutes expiry
    // await this.cacheService.set(`otp:${verificationId}`, otp, 300);

    // Send SMS via Twilio
    // await this.smsService.sendSMS(phoneNumber, `Your AgriConnect verification code is: ${otp}`);

    return {
      success: true,
      verificationId,
    };
  }

  async verifyOTP(verificationId: string, otp: string): Promise<AuthResponseDto> {
    // Validate OTP from Redis
    // const storedOtp = await this.cacheService.get(`otp:${verificationId}`);
    // if (!storedOtp || storedOtp !== otp) {
    //   throw new BadRequestException('Invalid OTP');
    // }

    // Find or create user with phone
    // const user = await this.userRepository.findOne({ where: { phoneNumber } });
    // if (!user) {
    //   // Create new user
    // }

    throw new Error('Method not implemented');
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomUUID();
    // Store in Redis with 1 hour expiry
    // await this.cacheService.set(`reset:${resetToken}`, user.id, 3600);

    // //Send reset email
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    // const userId = await this.cacheService.get(`reset:${token}`);
    // if (!userId) {
    //   throw new BadRequestException('Invalid or expired token');
    // }

    // const user = await this.userRepository.findOne({ where: { id: userId } });
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(newPassword, salt);
    // await this.userRepository.save(user);

    // await this.cacheService.del(`reset:${token}`);

    return { success: true };
  }
}