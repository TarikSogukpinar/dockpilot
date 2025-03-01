import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContainerDto {
  @ApiProperty({
    description: 'Container name',
    example: 'caddy-container',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Docker image name',
    example: 'caddy:latest',
  })
  @IsNotEmpty()
  @IsString()
  Image: string;
}
