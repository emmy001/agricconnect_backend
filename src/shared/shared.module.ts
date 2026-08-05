// src/shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CacheService } from './services/cache.service';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';

import { LoggerService } from './services/logger.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 3600,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService, EmailService, SMSService, LoggerService],
  exports: [CacheService, EmailService, SMSService, LoggerService],
})
export class SharedModule {}