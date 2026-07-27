import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class PredictYieldDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cropType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  area: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  soilType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rainfall?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;
}