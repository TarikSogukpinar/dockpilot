import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class DeleteConnectionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
