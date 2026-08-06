// src/shared/services/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    // __dirname at runtime resolves to dist/shared/services.
    // Templates actually live under dist/modules/notifications/templates/email.
    // ".." -> dist/shared, ".." -> dist, then into modules/notifications/templates/email.
    const templatePath = path.join(
      __dirname,
      '..', '..',
      'modules', 'notifications', 'templates', 'email',
      `${templateName}.html`,
    );
    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiled = handlebars.compile(template);
    return compiled(data);
  }

  async sendWelcomeEmail(email: string, name: string, getStartedUrl: string): Promise<void> {
    const html = await this.renderTemplate('welcome', { name, getStartedUrl });
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Welcome to AgriConnect!',
      html,
    });
  }

  async sendBookingConfirmationEmail(email: string, data: any): Promise<void> {
    const html = await this.renderTemplate('booking-confirmation', data);
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Booking Confirmation - AgriConnect',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
    const html = await this.renderTemplate('password-reset', { name, resetUrl });
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Reset Your Password - AgriConnect',
      html,
    });
  }
}