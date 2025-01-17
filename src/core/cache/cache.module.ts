import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService } from './cache.service';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                const redis = new Redis({
                    host: process.env.REDIS_HOST,
                    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                })

                redis.on('connect', () => {
                    console.log('Connected to Redis', process.env.REDIS_HOST, process.env.REDIS_PORT);
                });

                redis.on('error', (err) => {
                    console.error('Redis error:', err.message);
                });

                return redis;
            },
        },
        CacheService
    ],
    exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule { }