import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  Max,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be less than 100 characters long' })
  name: string;

  @IsOptional()
  @IsObject()
  tlsConfig?: {
    ca?: string;
    cert?: string;
    key?: string;
  };

  @IsOptional()
  @IsBoolean()
  autoReconnect?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  connectionTimeout?: number;

  @IsOptional()
  @IsObject()
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };

  @IsOptional()
  @IsString()
  location?: string;
}
