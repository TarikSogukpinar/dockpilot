import { IsString, IsNumber, IsOptional, IsObject, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateConnectionDto {
    @IsString()
    @IsNotEmpty()
    host: string;

    @IsNumber()
    @Min(1)
    @Max(65535)
    port: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsObject()
    tlsConfig?: {
        ca?: string;
        cert?: string;
        key?: string;
    };
}