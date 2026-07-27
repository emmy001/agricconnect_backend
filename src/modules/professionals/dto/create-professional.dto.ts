// src/modules/professionals/dto/create-professional.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProfessionalDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  pricing?: {
    basePrice: number;
    emergencyFee: number;
    distanceFeePerKm: number;
    minimumPrice: number;
    maximumPrice: number;
    currency: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasVehicle?: boolean;
}