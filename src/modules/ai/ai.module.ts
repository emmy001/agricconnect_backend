import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { Diagnosis } from './entities/diagnosis.entity';
import { Prediction } from './entities/prediction.entity';
import { WeatherForecast } from './entities/weather-forecast.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diagnosis, Prediction, WeatherForecast]),
    UsersModule,
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}