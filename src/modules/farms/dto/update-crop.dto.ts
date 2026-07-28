// src/modules/farms/dto/update-crop.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsObject } from 'class-validator';
import { CropStage } from '../entities/crop.entity';

export class UpdateCropDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variety?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  expectedHarvest?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  yieldEstimate?: number;

  @ApiProperty({ enum: CropStage, required: false })
  @IsOptional()
  @IsEnum(CropStage)
  stage?: CropStage;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}