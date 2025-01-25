import { Module } from '@nestjs/common';
import { VolumeController } from './volume.controller';
import { VolumeService } from './volume.service';
import { PrismaModule } from '../database/database.module';
import { ConnectionModule } from '../connection/connection.module';
import { ConnectionChecker } from '../connection/connection.checker';

@Module({
    imports: [PrismaModule, ConnectionModule],
    controllers: [VolumeController],
    providers: [VolumeService, ConnectionChecker],
    exports: [VolumeService],
})
export class VolumeModule { }
