import { ApiProperty } from '@nestjs/swagger';
import { ContainerStatus } from '@prisma/client';

export class CreateContainerResponseDto {
  @ApiProperty({ description: 'HTTP Status code', example: 200 })
  status: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Container created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Container details',
    example: {
      id: 'abc123def456',
      name: 'my-nginx',
      status: 'RUNNING',
      dockerId: '123456789abcdef',
      createdAt: '2024-03-14T12:00:00Z',
    },
  })
  data: {
    id: string;
    name: string;
    status: ContainerStatus;
    dockerId: string;
    createdAt: Date;
  };
}
