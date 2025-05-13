import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Verify2faDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  twoFactorToken: string;
} 