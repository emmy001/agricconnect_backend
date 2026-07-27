// src/modules/farms/dto/create-vaccination.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { VaccinationStatus } from '../entities/vaccination.entity';

export class CreateVaccinationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vaccineType?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  dueDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  administeredDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  administeredBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  nextDueDate?: Date;

  @ApiProperty({ enum: VaccinationStatus, default: VaccinationStatus.PENDING })
  @IsOptional()
  @IsEnum(VaccinationStatus)
  status?: VaccinationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}