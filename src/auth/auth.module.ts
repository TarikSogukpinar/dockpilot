import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { PrismaService } from '../database/database.service';
import { TokenModule } from '../core/token/token.module';
import { PrismaModule } from 'src/database/database.module';
import { PassportModule } from '@nestjs/passport';
import { HashingModule } from 'src/utils/hashing/hashing.module';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TwoFactorService } from './two-factor/two-factor.service';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    HashingModule,
    TokenModule,
    PrismaModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [AuthController, TwoFactorController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    GithubStrategy,
    GoogleStrategy,
    TwoFactorService,
  ],
  exports: [AuthService, TwoFactorService],
})
export class AuthModule {}
