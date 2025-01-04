import { Module } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ContainerController } from "./container.controller";
import { ConnectionModule } from "src/connection/connection.module";

@Module({
    imports: [ConnectionModule],
    controllers: [ContainerController],
    providers: [ContainerService],
    exports: [ContainerService],
})
export class ContainerModule { }