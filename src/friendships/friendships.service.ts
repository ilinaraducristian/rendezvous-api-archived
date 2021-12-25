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

@Injectable()
export class FriendshipsService {

  constructor(
    @InjectModel(Friendship.name) private readonly friendshipModel: Model<Friendship>
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

    return {
      user1Id,
      user2Id,
      status: FriendshipStatus.pending
    };

  }

  async updateFriendship(userId: string, friendshipId: string, status: FriendshipStatus) {

    if (status === FriendshipStatus.pending) {
      throw new BadFriendshipStatusException();
    }

    let friendship: FriendshipDocument;

    try {
      friendship = await this.friendshipModel.findOne({ _id: friendshipId, user2Id: userId });
      if (friendship === null || friendship === undefined) throw new Error();
    } catch (e) {
      throw new FriendshipNotFoundException();
    }

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

    try {
      const deleteResult = await this.friendshipModel.deleteOne({ _id: friendshipId, user1Id: userId });
      if (deleteResult === null || deleteResult === undefined) throw new Error();
    } catch (e) {
      throw new FriendshipNotFoundException();
    }

  }

}
