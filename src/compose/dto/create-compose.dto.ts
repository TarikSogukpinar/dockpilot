import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateComposeDto {
  @ApiProperty({ description: 'Name of the compose deployment' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the compose deployment' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'UUID of the connection to use' })
  @IsString()
  connectionUuid: string;

  @ApiPropertyOptional({ description: 'Docker compose content as string' })
  @IsOptional()
  @IsString()
  composeContent?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Docker compose file (docker-compose.yml)',
  })
  composeFile?: any;

  @ApiPropertyOptional({
    description: 'Environment variables to use in compose file',
    example: { DB_PASSWORD: 'secret', API_KEY: '123456' },
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return {};
      }
    }
    return value || {};
  })
  environmentVariables?: Record<string, string>;

  @ApiProperty({ description: 'Whether to pull latest images', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value ?? true;
  })
  pullLatest?: boolean = true;
}
