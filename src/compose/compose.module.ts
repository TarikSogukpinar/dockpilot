import { Module } from '@nestjs/common';
import { ComposeController } from './compose.controller';
import { ComposeService } from './compose.service';
import { PrismaModule } from '../database/database.module';
import { ConnectionModule } from '../connection/connection.module';
import { ConnectionChecker } from '../connection/connection.checker';

@Module({
  imports: [PrismaModule, ConnectionModule],
  controllers: [ComposeController],
  providers: [ComposeService, ConnectionChecker],
  exports: [ComposeService],
})
export class ComposeModule {}
