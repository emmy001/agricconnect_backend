import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // Note: full cache reset is no longer part of the public Cache type
  // as of cache-manager v5+. If you need to wipe everything, either
  // track keys yourself and del() them individually, or access the
  // underlying store directly (implementation-specific).
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    let value = await this.get<T>(key);
    if (!value) {
      value = await fn();
      await this.set(key, value, ttl);
    }
    return value;
  }
}