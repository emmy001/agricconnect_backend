// src/shared/services/logger.service.ts
import { Injectable, Logger as NestLogger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  private nestLogger: NestLogger;

  constructor() {
    this.nestLogger = new NestLogger();
    
    const transport = new winston.transports.DailyRotateFile({
      filename: 'logs/agriconnect-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    });

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        transport,
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  info(message: string, context?: string): void {
    this.logger.info(message, { context });
    this.nestLogger.log(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
    this.nestLogger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
    this.nestLogger.warn(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
    this.nestLogger.debug(message, context);
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
    this.nestLogger.verbose(message, context);
  }
}