import { IsNotEmpty } from "class-validator";
import { IsNumber } from "class-validator";

export class GetConnectionsDto {

    @IsNumber()
    @IsNotEmpty()
    userId: number;
}