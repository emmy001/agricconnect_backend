import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserStatus } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async findAll(params: { page: number; limit: number; role?: string; status?: string }): Promise<{ users: User[]; total: number }> {
    const { page, limit, role, status } = params;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { users, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);
    await this.userRepository.save(user);

    return { success: true };
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const user = await this.findById(id);
    await this.userRepository.softDelete(id);
    return { success: true };
  }

  async verify(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isVerified = true;
    return this.userRepository.save(user);
  }

  async block(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.BLOCKED;
    return this.userRepository.save(user);
  }

  async unblock(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findBy({ id: In(ids) });
  }

  async updateRating(userId: string, newRating?: number): Promise<User> {
    const user = await this.findById(userId);

    if (newRating !== undefined) {
      const totalScore = user.rating * user.totalReviews + newRating;
      user.totalReviews += 1;
      user.rating = totalScore / user.totalReviews;
      await this.userRepository.save(user);
    }
    // NOTE: called with no rating value from bookings.service.ts today.
    // Wire the actual review score through once reviews are available there.

    return user;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const user = await this.findById(userId);
    return Number(user.walletBalance);
  }

  async deductWalletBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    if (Number(user.walletBalance) < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }
    user.walletBalance = Number(user.walletBalance) - amount;
    return this.userRepository.save(user);
  }

  async addWalletBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    user.walletBalance = Number(user.walletBalance) + amount;
    return this.userRepository.save(user);
  }
}