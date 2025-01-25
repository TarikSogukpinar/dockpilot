import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateEmailDto {
    @ApiProperty({ description: 'New email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Current password for verification' })
    @IsString()
    password: string;
} 