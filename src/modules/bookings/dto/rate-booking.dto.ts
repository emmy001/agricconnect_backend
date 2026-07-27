// src/modules/bookings/dto/rate-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class RateBookingDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reviewImages?: string[];
}