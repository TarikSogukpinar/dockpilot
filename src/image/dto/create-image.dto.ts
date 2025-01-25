import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateImageDto {
    @ApiProperty({ description: 'Name of the image to pull' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Connection UUID to use' })
    @IsString()
    connectionId: string;

    @ApiPropertyOptional({ description: 'Tag of the image', default: 'latest' })
    @IsString()
    @IsOptional()
    tag?: string = 'latest';

    @ApiPropertyOptional({ description: 'Registry URL' })
    @IsString()
    @IsOptional()
    registry?: string;

    @ApiPropertyOptional({ description: 'Registry username' })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional({ description: 'Registry password' })
    @IsString()
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ description: 'Platform for the image (e.g., linux/amd64)', example: 'linux/amd64' })
    @IsString()
    @IsOptional()
    platform?: string;

    @ApiPropertyOptional({ description: 'Whether to force pull the image', default: false })
    @IsBoolean()
    @IsOptional()
    forcePull?: boolean = false;
} 