import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ description: 'Enable/disable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ description: 'Enable/disable container status alerts' })
  @IsOptional()
  @IsBoolean()
  containerAlerts?: boolean;

  @ApiProperty({ description: 'Enable/disable resource usage alerts' })
  @IsOptional()
  @IsBoolean()
  resourceAlerts?: boolean;

  @ApiProperty({ description: 'Enable/disable two-factor authentication' })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiProperty({ description: 'Enable/disable API key usage' })
  @IsOptional()
  @IsBoolean()
  apiKeyEnabled?: boolean;
} 