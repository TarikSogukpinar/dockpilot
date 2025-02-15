import { IsNumber } from "class-validator";


export class FindConnectionByIdRequestDto {
    @IsNumber()
    id: number;
}