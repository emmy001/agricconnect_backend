import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AnalyzeImageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string; // 'plant', 'animal', 'other'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}