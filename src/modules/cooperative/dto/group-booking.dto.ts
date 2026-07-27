// src/modules/cooperative/dto/group-booking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class GroupBookingDto {
  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  serviceIds: string[];

  @ApiProperty({ default: 1 })
  @IsNumber()
  memberCount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;
}