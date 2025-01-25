import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheServiceInterface } from './cache.interface';

@Injectable()
export class CacheService implements ICacheServiceInterface {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    ) { }

    async setCache(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redisClient.set(key, value, 'EX', ttl);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async getCache(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async deleteCache(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async publish(channel: string, message: string): Promise<number> {
        return this.redisClient.publish(channel, message);
    }

    subscribe(channel: string, callback: (message: string) => void): void {
        const subscriber = this.redisClient.duplicate();
        subscriber.subscribe(channel, (err, count) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log(`Subscribed to ${channel}. Channel count: ${count}`);
            }
        });

        subscriber.on('message', (chan, msg) => {
            if (chan === channel) {
                callback(msg); // Gelen mesajı işleme al
            }
        });
    }
}