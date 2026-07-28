// src/modules/farms/dto/create-health-record.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { HealthRecordType } from '../entities/health-record.entity';

export class CreateHealthRecordDto {
  @ApiProperty({ enum: HealthRecordType })
  @IsNotEmpty()
  @IsEnum(HealthRecordType)
  type: HealthRecordType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  veterinarian?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  medication?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prognosis?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  date: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  nextCheckup?: Date;
}