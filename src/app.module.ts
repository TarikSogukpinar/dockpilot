import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/database.module';
import { ContainerModule } from './container/container.module';
import { SwaggerModule } from './core/swagger/swagger.module';
import { AuthModule } from './auth/auth.module';
import { ConnectionModule } from './connection/connection.module';
import { ComposeModule } from './compose/compose.module';
import { UserModule } from './user/user.module';
import { ImageModule } from './image/image.module';
import { NetworkModule } from './network/network.module';
import { ResourceModule } from './resource/resource.module';
import { BackupModule } from './backup/backup.module';
import { VolumeModule } from './volume/volume.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV;
        const envFilePath =
          env === 'production'
            ? '.env.production'
            : env === 'staging'
              ? '.env.staging'
              : '.env.development';
        console.log(`Loading environment variables from ${envFilePath}`);
        return envFilePath;
      })(),
    }),
    SwaggerModule,
    AuthModule,
    PrismaModule,
    ContainerModule,
    ConnectionModule,
    UserModule,
    ComposeModule,
    ImageModule,
    NetworkModule,
    ResourceModule,
    BackupModule,
    VolumeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
