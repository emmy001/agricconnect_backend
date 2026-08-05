import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Device } from './entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Device])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}