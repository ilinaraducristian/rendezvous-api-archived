import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Friendship, { FriendshipDocument } from "../entities/friendship";
import {
  AlreadyFriendsException,
  BadFriendshipStatusException,
  FriendshipCannotBeUpdatedException
} from "../exceptions/BadRequestExceptions";
import FriendshipStatus from "../dtos/friendship-status";
import { FriendshipNotFoundException } from "../exceptions/NotFoundExceptions";
import FriendshipMessage from "../entities/friendship-message";

@Injectable()
export class FriendshipsService {

  constructor(
    @InjectModel(Friendship.name) private readonly friendshipModel: Model<Friendship>,
    @InjectModel(FriendshipMessage.name) private readonly messageModel: Model<FriendshipMessage>
  ) {
  }

  async createFriendship(user1Id: string, user2Id: string) {
    const friendshipExists = await this.friendshipModel.exists({
      $or: [
        { user1Id, user2Id },
        {
          user1Id: user2Id,
          user2Id: user1Id
        }]
    });

    if (friendshipExists) {
      throw new AlreadyFriendsException();
    }

    const newFriendship = new this.friendshipModel({
      user1Id,
      user2Id
    });

    await newFriendship.save();

    return newFriendship.toObject();

  }

  async getById(userId: string, friendshipId: string) {
    const friendship = await this.friendshipModel.findOne({
      _id: friendshipId,
      $or: [{ user1Id: userId }, { user2Id: userId }]
    });
    if (friendship === undefined) throw new FriendshipNotFoundException();
    return friendship as FriendshipDocument;
  }

  async updateFriendship(userId: string, friendshipId: string, status: FriendshipStatus) {

    if (status === FriendshipStatus.pending) {
      throw new BadFriendshipStatusException();
    }

    let friendship: FriendshipDocument;

    try {
      friendship = await this.friendshipModel.findOne({ _id: friendshipId, user2Id: userId });
    } catch (e) {
      throw new FriendshipNotFoundException();
    }
    if (friendship === null || friendship === undefined) throw new FriendshipNotFoundException();

    if (friendship.status !== FriendshipStatus.pending) {
      throw new FriendshipCannotBeUpdatedException();
    }

    friendship.status = status;

    await friendship.save();

    return {
      user1Id: friendship.user1Id,
      user2Id: friendship.user2Id,
      status
    };

  }

  async deleteFriendship(userId: string, friendshipId: string) {

    let deleteResult;

    await this.messageModel.deleteMany({ friendshipId });

    try {
      deleteResult = await this.friendshipModel.deleteOne({ _id: friendshipId, user1Id: userId });
    } catch (e) {
      throw new FriendshipNotFoundException();
    }
    if (deleteResult === null || deleteResult === undefined) throw new FriendshipNotFoundException();

  }

}
