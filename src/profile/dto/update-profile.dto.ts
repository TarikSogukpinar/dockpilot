import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsUrl, IsBoolean, IsNumber, Min, IsEnum } from 'class-validator';

enum Theme {
    LIGHT = 'light',
    DARK = 'dark'
}

enum Language {
    EN = 'en',
    TR = 'tr'
}

export class UpdateProfileDto {
    // Kişisel Bilgiler
    @ApiProperty({ description: 'User company name' })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    company?: string;

    @ApiProperty({ description: 'User phone number' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ description: 'User address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ description: 'User bio' })
    @IsOptional()
    @IsString()
    @Length(0, 500)
    bio?: string;

    // Profesyonel Bilgiler
    @ApiProperty({ description: 'Job title' })
    @IsOptional()
    @IsString()
    jobTitle?: string;

    @ApiProperty({ description: 'Department' })
    @IsOptional()
    @IsString()
    department?: string;

    // Sosyal Medya
    @ApiProperty({ description: 'Website URL' })
    @IsOptional()
    @IsUrl()
    website?: string;

    @ApiProperty({ description: 'GitHub profile' })
    @IsOptional()
    @IsUrl()
    github?: string;

    @ApiProperty({ description: 'Docker Hub username' })
    @IsOptional()
    @IsString()
    dockerHub?: string;

    // Docker Tercihleri
    @ApiProperty({ description: 'Default container registry URL' })
    @IsOptional()
    @IsUrl()
    defaultRegistryUrl?: string;

    @ApiProperty({ description: 'Default image prefix' })
    @IsOptional()
    @IsString()
    defaultImagePrefix?: string;

    @ApiProperty({ description: 'Preferred network mode' })
    @IsOptional()
    @IsString()
    preferredNetwork?: string;

    @ApiProperty({ description: 'Default restart policy' })
    @IsOptional()
    @IsString()
    defaultRestartPolicy?: string;

    // Bildirim Tercihleri
    @ApiProperty({ description: 'Enable email notifications' })
    @IsOptional()
    @IsBoolean()
    emailNotifications?: boolean;

    @ApiProperty({ description: 'Enable container alerts' })
    @IsOptional()
    @IsBoolean()
    containerAlerts?: boolean;

    @ApiProperty({ description: 'Enable resource alerts' })
    @IsOptional()
    @IsBoolean()
    resourceAlerts?: boolean;

    // Güvenlik Tercihleri
    @ApiProperty({ description: 'Enable two-factor authentication' })
    @IsOptional()
    @IsBoolean()
    twoFactorEnabled?: boolean;

    @ApiProperty({ description: 'Enable API key usage' })
    @IsOptional()
    @IsBoolean()
    apiKeyEnabled?: boolean;

    // Sistem Tercihleri
    @ApiProperty({ description: 'UI theme', enum: Theme })
    @IsOptional()
    @IsEnum(Theme)
    theme?: Theme;

    @ApiProperty({ description: 'Preferred language', enum: Language })
    @IsOptional()
    @IsEnum(Language)
    language?: Language;

    @ApiProperty({ description: 'Time zone' })
    @IsOptional()
    @IsString()
    timeZone?: string;
} 