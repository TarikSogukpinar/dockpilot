import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from '../guard/auth.guard';
import { CustomRequest } from '../../core/request/customRequest';
import { Enable2faDto } from '../dto/requests/enable-2fa.dto';
import { Verify2faDto } from '../dto/requests/verify-2fa.dto';

@Controller({ path: 'auth/2fa', version: '1' })
@ApiTags('Two-Factor Authentication')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({
    status: 200,
    description: 'Returns 2FA secret and QR code',
  })
  async generate(@Req() req: CustomRequest) {
    const result = await this.twoFactorService.generateSecret(req.user.id);
    return {
      message: 'Two-factor authentication secret generated',
      result,
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify 2FA token' })
  @ApiResponse({
    status: 200,
    description: 'Returns verification result',
  })
  async verify(@Body() verify2faDto: Verify2faDto) {
    try {
      const userId = parseInt(verify2faDto.userId);
      const isValid = await this.twoFactorService.verifyToken(
        userId,
        verify2faDto.twoFactorToken,
      );

      return {
        message: isValid ? 'Token verified successfully' : 'Invalid token',
        result: { valid: isValid },
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable or disable 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Returns enable status',
  })
  async enable(
    @Req() req: CustomRequest,
    @Body() enable2faDto: Enable2faDto,
  ) {
    try {
      const result = await this.twoFactorService.enableTwoFactor(
        req.user.id,
        enable2faDto.enable,
        enable2faDto.twoFactorToken,
      );

      return {
        message: result.enabled
          ? 'Two-factor authentication enabled'
          : 'Two-factor authentication disabled',
        result,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
} 