import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../database/database.service';
import { HashingService } from 'src/utils/hashing/hashing.service';

@Module({
    controllers: [ProfileController],
    providers: [ProfileService, PrismaService, HashingService],
    exports: [ProfileService],
})
export class ProfileModule { } 