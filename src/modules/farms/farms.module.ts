import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';
import { Farm } from './entities/farm.entity';
import { FarmBoundary } from './entities/farm-boundary.entity';
import { Animal } from './entities/animal.entity';
import { Crop } from './entities/crop.entity';
import { HealthRecord } from './entities/health-record.entity';
import { Vaccination } from './entities/vaccination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Farm,
      FarmBoundary,
      Animal,
      Crop,
      HealthRecord,
      Vaccination,
    ]),
  ],
  controllers: [FarmsController],
  providers: [FarmsService],
  exports: [FarmsService],
})
export class FarmsModule {}