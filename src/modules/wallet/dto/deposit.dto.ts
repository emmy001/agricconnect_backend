// src/modules/wallet/dto/deposit.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class DepositDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expiry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cvv?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cardHolder?: string;
}