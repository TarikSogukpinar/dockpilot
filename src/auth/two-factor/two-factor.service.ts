import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from '../../database/database.service';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a secret key for a user
   */
  async generateSecret(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate a secret key for the user
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('APP_NAME') || 'DockPilot';
    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);

    // Generate QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Store the secret temporarily (until verified)
    await this.prismaService.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        twoFactorTempSecret: secret,
      },
      update: {
        twoFactorTempSecret: secret,
      },
    });

    return {
      secret,
      otpAuthUrl,
      qrCodeDataUrl,
    };
  }

  /**
   * Verify a token against the user's secret
   */
  async verifyToken(userId: number, token: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new Error('User not found');
    }

    // Check if we're verifying a temp secret or the actual secret
    const secret = user.profile.twoFactorTempSecret || user.profile.twoFactorSecret;
    
    if (!secret) {
      throw new Error('Two-factor authentication not set up');
    }

    // Verify the token
    return authenticator.verify({ token, secret });
  }

  /**
   * Enable or disable 2FA for a user
   */
  async enableTwoFactor(userId: number, enable: boolean, token?: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new Error('User not found');
    }

    // If enabling, verify the token
    if (enable && token) {
      const isValid = await this.verifyToken(userId, token);

      if (!isValid) {
        throw new Error('Invalid authentication code');
      }

      // Move temp secret to permanent secret
      await this.prismaService.profile.update({
        where: { userId: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: user.profile.twoFactorTempSecret,
          twoFactorTempSecret: null,
        },
      });

      return { enabled: true };
    } 
    
    // If disabling
    if (!enable) {
      await this.prismaService.profile.update({
        where: { userId: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorTempSecret: null,
        },
      });

      return { enabled: false };
    }

    throw new Error('Invalid operation');
  }
} 