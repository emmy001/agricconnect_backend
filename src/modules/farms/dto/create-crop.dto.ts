// src/modules/farms/dto/create-crop.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { CropStage } from '../entities/crop.entity';

export class CreateCropDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  variety: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  area: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  plantingDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  expectedHarvest?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  yieldEstimate?: number;

  @ApiProperty({ enum: CropStage, default: CropStage.PLANTING })
  @IsOptional()
  @IsEnum(CropStage)
  stage?: CropStage;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}