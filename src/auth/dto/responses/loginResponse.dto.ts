import { IsEmail, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class LoginResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsEmail()
  email: string;

  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  twoFactorEnabled: boolean;
}
