import { Module } from "@nestjs/common";
import { EmojisController } from "./emojis.controller";

@Module({
  controllers: [EmojisController]
})
export class EmojisModule {
}
