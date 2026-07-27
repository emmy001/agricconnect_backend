import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('APPLE_CLIENT_ID'),
      teamID: configService.get('APPLE_TEAM_ID'),
      keyID: configService.get('APPLE_KEY_ID'),
      privateKeyString: configService.get('APPLE_PRIVATE_KEY'),
      callbackURL: `${configService.get('API_URL')}/api/v1/auth/apple/callback`,
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { name, email } = profile;
    const user = {
      email,
      firstName: name?.firstName || '',
      lastName: name?.lastName || '',
      accessToken,
    };
    done(null, user);
  }
}