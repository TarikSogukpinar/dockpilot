import { Module } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ContainerController } from "./container.controller";

@Module({
    imports: [],
    controllers: [ContainerController],
    providers: [ContainerService],
    exports: [ContainerService],
})
export class ContainerModule { }