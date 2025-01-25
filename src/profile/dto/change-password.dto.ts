import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Current password' })
    @IsString()
    currentPassword: string;

    @ApiProperty({ description: 'New password' })
    @IsString()
    @Length(8, 32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password is too weak',
    })
    newPassword: string;

    @ApiProperty({ description: 'Confirm new password' })
    @IsString()
    @Length(8, 32)
    confirmNewPassword: string;
} 