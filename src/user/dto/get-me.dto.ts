import { ApiProperty } from '@nestjs/swagger';
import { Role, AccountType } from '@prisma/client';

export class GetMeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  profile?: {
    company?: string;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    bio?: string;
    jobTitle?: string;
    department?: string;
    website?: string;
    github?: string;
    theme?: string;
    language?: string;
    timeZone?: string;
    lastLogin?: Date;
    lastActivity?: Date;
  };
}
