import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MongooseModule } from "@nestjs/mongoose";
import Member, { MemberSchema } from "../entities/member";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Member.name,
        schema: MemberSchema
      }
    ])
  ],
  providers: [MembersService],
  exports: [MembersService]
})
export class MembersModule {
}
