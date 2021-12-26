import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import Member, { MemberDocument } from "../entities/member";
import { AnyKeys, AnyObject, Model } from "mongoose";

@Injectable()
export class MembersService {

  constructor(
    @InjectModel(Member.name) private readonly memberModel: Model<Member>
  ) {
  }

  newMember(member: AnyKeys<Member> & AnyObject) {
    return new this.memberModel(member);
  }

  deleteMember(id: string, userId: string) {
    return this.memberModel.findOneAndDelete({ _id: id, userId });
  }

  getServers(userId: string) {
    return this.memberModel.find({ userId }).populate({
      path: "serverId", populate: "members"
    });
  }

  getMembers(serverId: string) {
    return this.memberModel.find({ serverId });
  }

  deleteServerMembers(serverId: string): any {
    return this.memberModel.deleteMany({ serverId });
  }

  getUserLastServer(userId: string) {
    return this.memberModel.find({ userId }).sort({ order: -1 }).limit(1);
  }

  getUserSortedServers(userId: string) {
    return this.memberModel.find({ userId }).sort({ order: 1 });
  }

  saveMembers(members: MemberDocument[]): Promise<any> {
    return this.memberModel.bulkSave(members);
  }

  async isMember(userId: string, serverId: string) {
    try {
      return await this.memberModel.exists({ userId, serverId });
    } catch (e) {
      return false;
    }
  }

}
