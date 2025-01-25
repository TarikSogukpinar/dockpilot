import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

enum Language {
  EN = 'en',
  TR = 'tr',
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timeZone?: string;
} 