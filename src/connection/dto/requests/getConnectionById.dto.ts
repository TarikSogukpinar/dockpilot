import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetConnectionByIdDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;
}
