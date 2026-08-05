import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
  })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}