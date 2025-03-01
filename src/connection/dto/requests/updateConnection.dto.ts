import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsNumber,
  IsObject,
  IsDate,
} from 'class-validator';

export class UpdateConnectionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  @IsNotEmpty()
  port: number;

  @IsObject()
  @IsNotEmpty()
  tlsConfig: any;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
