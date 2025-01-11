import { Module } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ContainerController } from "./container.controller";
import { ConnectionModule } from "src/connection/connection.module";
import { PrismaModule } from "src/database/database.module";

@Module({
    imports: [ConnectionModule, PrismaModule],
    controllers: [ContainerController],
    providers: [ContainerService],
    exports: [ContainerService],
})
export class ContainerModule { }