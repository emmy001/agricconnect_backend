// src/modules/users/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.findOne({ where: { phoneNumber: phone } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { status: UserStatus.ACTIVE } });
  }

  async findFarmers(): Promise<User[]> {
    return this.find({ where: { role: UserRole.FARMER } });
  }

  async findProfessionals(): Promise<User[]> {
    return this.find({ where: { role: UserRole.PROFESSIONAL } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { lastLogin: new Date() });
  }

  async getTotalUsers(): Promise<number> {
    return this.count();
  }

  async getActiveUsers(): Promise<number> {
    return this.count({ where: { status: UserStatus.ACTIVE } });
  }
}