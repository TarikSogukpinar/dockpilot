import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { PrismaModule } from '../database/database.module';
import { ConnectionModule } from '../connection/connection.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        PrismaModule,
        ConnectionModule,
        ScheduleModule.forRoot()
    ],
    controllers: [ResourceController],
    providers: [ResourceService],
    exports: [ResourceService],
})
export class ResourceModule { }
