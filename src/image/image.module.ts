import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { PrismaModule } from '../database/database.module';
import { ConnectionModule } from '../connection/connection.module';
import { ConnectionChecker } from 'src/connection/connection.checker';

@Module({
    imports: [PrismaModule, ConnectionModule],
    controllers: [ImageController],
    providers: [ImageService, ConnectionChecker],
    exports: [ImageService],
})
export class ImageModule { }
