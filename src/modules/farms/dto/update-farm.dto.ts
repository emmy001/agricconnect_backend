// src/modules/farms/dto/update-farm.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsObject, IsEnum } from 'class-validator';
import { FarmType } from '../entities/farm.entity';

export class UpdateFarmDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: FarmType, required: false })
  @IsOptional()
  @IsEnum(FarmType)
  type?: FarmType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}