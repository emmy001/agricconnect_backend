// src/modules/admin/dto/verify-professional.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ProfessionalStatus } from '../../professionals/entities/professional.entity';

export class VerifyProfessionalDto {
  @ApiProperty({ enum: ProfessionalStatus })
  @IsNotEmpty()
  @IsEnum(ProfessionalStatus)
  status: ProfessionalStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}