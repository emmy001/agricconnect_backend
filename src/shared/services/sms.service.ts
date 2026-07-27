// src/shared/services/sms.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SMSService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      configService.get('TWILIO_ACCOUNT_SID'),
      configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    await this.client.messages.create({
      body: message,
      to: phoneNumber,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
    });
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your AgriConnect verification code is: ${otp}. Valid for 5 minutes.`;
    await this.sendSMS(phoneNumber, message);
  }

  async sendBookingConfirmation(phoneNumber: string, bookingId: string, professionalName: string): Promise<void> {
    const message = `AgriConnect: Booking confirmed! ID: ${bookingId.slice(0, 8)}. Professional: ${professionalName}`;
    await this.sendSMS(phoneNumber, message);
  }
}