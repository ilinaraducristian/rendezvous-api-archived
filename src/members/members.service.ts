import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import Member from "../entities/member";
import { Model } from "mongoose";

@Injectable()
export class MembersService {

  constructor(
    @InjectModel(Member.name) private readonly memberModel: Model<Member>
  ) {
  }

  async isMember(userId: string, serverId: string) {
    try {
      return await this.memberModel.exists({ userId, serverId });
    } catch (e) {
      return false;
    }
  }

}
