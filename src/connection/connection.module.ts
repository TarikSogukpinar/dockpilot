import { Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { PrismaService } from 'src/database/database.service';
import { EncryptionModule } from 'src/core/encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [ConnectionController],
  providers: [ConnectionService, PrismaService],
  exports: [ConnectionService],
})
export class ConnectionModule {}
