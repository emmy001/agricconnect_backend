import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { ProfessionalStatus } from '../entities/professional.entity';

export class UpdateProfessionalDto {
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
  isAvailable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasVehicle?: boolean;

  @ApiProperty({ enum: ProfessionalStatus, required: false })
  @IsOptional()
  @IsEnum(ProfessionalStatus)
  verificationStatus?: ProfessionalStatus;
}