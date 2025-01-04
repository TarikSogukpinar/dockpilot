import { Module } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';

@Module({
    providers: [ConnectionService, PrismaService],
    controllers: [ConnectionController],
    exports: [ConnectionService],
})
export class ConnectionModule { }