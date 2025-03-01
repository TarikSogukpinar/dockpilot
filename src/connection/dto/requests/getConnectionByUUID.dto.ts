import { IsNumber, IsUUID } from 'class-validator';

export class GetConnectionByUUIDDto {
  @IsNumber()
  userId: number;

  @IsUUID()
  uuid: string;
}
