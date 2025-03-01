import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { PrismaModule } from '../database/database.module';
import { ConnectionModule } from '../connection/connection.module';
import { ConnectionChecker } from '../connection/connection.checker';

@Module({
  imports: [PrismaModule, ConnectionModule],
  controllers: [NetworkController],
  providers: [NetworkService, ConnectionChecker],
  exports: [NetworkService],
})
export class NetworkModule {}
