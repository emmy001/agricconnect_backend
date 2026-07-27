import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsArray, IsObject } from 'class-validator';
import { ServiceCategory } from '../entities/booking.entity';

export class CreateBookingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  farmerId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  professionalId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ enum: ServiceCategory })
  @IsNotEmpty()
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  scheduledStart?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  scheduledEnd?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  pickupLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  distance: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  estimatedPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}