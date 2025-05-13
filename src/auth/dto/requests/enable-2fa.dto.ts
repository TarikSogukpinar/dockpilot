import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class Enable2faDto {
  @IsBoolean()
  @IsNotEmpty({ message: 'Enable flag is required' })
  enable: boolean;

  @IsString()
  twoFactorToken?: string;
} 