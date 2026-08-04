import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CooperativeController } from './cooperative.controller';
import { CooperativeService } from './cooperative.service';
import { Cooperative } from './entities/cooperative.entity';
import { CooperativeMember } from './entities/cooperative-member.entity';
import { CooperativeService as CooperativeServiceEntity } from './entities/cooperative-service.entity';
import { GroupBooking } from './entities/group-booking.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cooperative,
      CooperativeMember,
      CooperativeServiceEntity,
      GroupBooking,
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [CooperativeController],
  providers: [CooperativeService],
  exports: [CooperativeService, TypeOrmModule],
})
export class CooperativeModule {}