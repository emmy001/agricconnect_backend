// src/shared/services/sms.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SMSService {
  private readonly smsTokenEndpoint = 'http://45.77.205.229:9001/api/v1/oauth2/token/';
  private readonly smsApiEndpoint = 'http://45.77.205.229:9001/api/v1/messaging/sms/send/';
  private readonly clientId = 'zSZ6V4TMyhEhtFjM1WjS5DsymoWElJePgWaobwaY';
  private readonly clientSecret = 'TOE0yy1yPkLWFKXRjB6pw1LvSBKYQEkZJlm2FRCVaCMK7DJFlt4vL0Tyd9yS2JTcaKFheukyiz01mfco2GqY6AckpgZea2Zmk00OFNNlpxUajhxiXZkcXgEuLUNhhnxg';
  private readonly scope = 'api_user:write send_sms:write';
  
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {}

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        this.smsTokenEndpoint,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.scope,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.status === 200) {
        this.accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in;
        this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000);
        return this.accessToken;
      } else {
        throw new Error(`Failed to get access token: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to authenticate with SMS gateway');
    }
  }

  async sendSMS(mobileNumber: string, message: string): Promise<boolean> {
    try {
      // Format mobile number to international format
      let formattedNumber = mobileNumber;
      if (mobileNumber.startsWith('0')) {
        formattedNumber = `254${mobileNumber.substring(1)}`;
      } else if (!mobileNumber.startsWith('254') && !mobileNumber.startsWith('+')) {
        formattedNumber = `254${mobileNumber}`;
      } else if (mobileNumber.startsWith('+')) {
        formattedNumber = mobileNumber.substring(1);
      }

      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        this.smsApiEndpoint,
        {
          recipients: [formattedNumber],
          message: message,
          sender: 'MAJISOFT',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log('SMS sent successfully');
        return true;
      } else {
        console.error(`Failed to send SMS: ${response.status} - ${response.data}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your AgriConnect verification code is: ${otp}. Valid for 5 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }

  async sendBookingConfirmation(phoneNumber: string, bookingId: string, professionalName: string): Promise<boolean> {
    const message = `AgriConnect: Booking confirmed! ID: ${bookingId.slice(0, 8)}. Professional: ${professionalName}`;
    return this.sendSMS(phoneNumber, message);
  }
}