import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { PrismaModule } from '../database/database.module';
import { ConnectionModule } from '../connection/connection.module';
import { ConnectionChecker } from 'src/connection/connection.checker';

@Module({
  imports: [PrismaModule, ConnectionModule],
  controllers: [BackupController],
  providers: [BackupService, ConnectionChecker],
  exports: [BackupService],
})
export class BackupModule {}
