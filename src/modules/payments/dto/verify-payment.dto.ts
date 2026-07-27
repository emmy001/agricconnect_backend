// src/modules/payments/dto/verify-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reference: string;
}