import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  verificationId: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  otp: string;
}