// src/modules/farms/dto/create-farm.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, IsEnum } from 'class-validator';
import { FarmType } from '../entities/farm.entity';

export class CreateFarmDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: FarmType })
  @IsNotEmpty()
  @IsEnum(FarmType)
  type: FarmType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  registeredNumber?: string;
}