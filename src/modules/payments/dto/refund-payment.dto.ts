import { IsIn, IsOptional } from 'class-validator';

export class RefundPaymentDto {
  amount: number;

  @IsOptional()
  @IsIn(['duplicate', 'fraudulent', 'requested_by_customer'])
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}