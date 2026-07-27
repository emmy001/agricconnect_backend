// src/modules/users/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

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
    return this.find({ where: { status: 'active' } });
  }

  async findFarmers(): Promise<User[]> {
    return this.find({ where: { role: 'farmer' } });
  }

  async findProfessionals(): Promise<User[]> {
    return this.find({ where: { role: 'professional' } });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { lastLogin: new Date() });
  }

  async getTotalUsers(): Promise<number> {
    return this.count();
  }

  async getActiveUsers(): Promise<number> {
    return this.count({ where: { status: 'active' } });
  }
}