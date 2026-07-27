import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({ example: '+254712345678' })
  @IsNotEmpty()
  phoneNumber: string;
}