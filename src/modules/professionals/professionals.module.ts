import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsService } from './professionals.service';
import { Professional } from './entities/professional.entity';
import { Certification } from './entities/certification.entity';
import { WorkingHour } from './entities/working-hour.entity';
import { Portfolio } from './entities/portfolio.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professional, Certification, WorkingHour, Portfolio]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService, TypeOrmModule],
})
export class ProfessionalsModule {}