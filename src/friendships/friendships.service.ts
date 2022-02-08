import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SocketIoService } from "src/socket-io/socket-io.service";
import FriendshipStatus from "../dtos/friendship-status";
import Friendship, { FriendshipDocument } from "../entities/friendship";
import FriendshipMessage from "../entities/friendship-message";
import {
    AlreadyFriendsException,
    BadFriendshipStatusException,
    FriendshipCannotBeUpdatedException,
    FriendshipNotAccessibleException
} from "../exceptions/BadRequestExceptions";
import { FriendshipNotFoundException } from "../exceptions/NotFoundExceptions";

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<Friendship>,
    @InjectModel(FriendshipMessage.name)
    private readonly messageModel: Model<FriendshipMessage>,
    private readonly socketIoService: SocketIoService
  ) {}

  async createFriendship(user1Id: string, user2Id: string) {
    const friendshipExists = await this.friendshipModel.exists({
      $or: [
        { user1Id, user2Id },
        {
          user1Id: user2Id,
          user2Id: user1Id,
        },
      ],
    });

    if (friendshipExists) {
      throw new AlreadyFriendsException();
    }

    const newFriendship = new this.friendshipModel({
      user1Id,
      user2Id,
    });

    await newFriendship.save();

    const friendshipDTO = Friendship.toDTO(newFriendship);
    this.socketIoService.newFriendship(friendshipDTO.user2Id, friendshipDTO);
    return friendshipDTO;
  }

  async getById(userId: string, friendshipId: string) {
    const friendship = await this.friendshipModel.findOne({
      _id: friendshipId,
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });
    if (friendship === undefined) throw new FriendshipNotFoundException();
    return friendship as FriendshipDocument;
  }

  async getAllByUserId(userId: string) {
    const friendships = await this.friendshipModel.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });
    return friendships as FriendshipDocument[];
  }

  async updateFriendship(
    userId: string,
    friendshipId: string,
    status: FriendshipStatus
  ) {
    if (status === FriendshipStatus.pending) {
      throw new BadFriendshipStatusException();
    }

    let friendship: FriendshipDocument;

    try {
      friendship = await this.friendshipModel.findOne({
        _id: friendshipId,
        user2Id: userId,
      });
    } catch (e) {
      throw new FriendshipNotFoundException();
    }
    if (friendship === null || friendship === undefined)
      throw new FriendshipNotFoundException();

    if (friendship.status !== FriendshipStatus.pending) {
      throw new FriendshipCannotBeUpdatedException();
    }

    friendship.status = status;

    await friendship.save();

    this.socketIoService.friendshipUpdate(
      friendship.user1Id,
      friendshipId,
      status
    );
  }

  async deleteFriendship(userId: string, friendshipId: string) {
    const friendship = await this.friendshipModel.findOne({
      _id: friendshipId,
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });

    if (friendship === null || friendship === undefined)
      throw new FriendshipNotFoundException();

    if (friendship.user1Id !== userId && friendship.user2Id !== userId)
      throw new FriendshipNotAccessibleException();

    await Promise.all([
      this.messageModel.deleteMany({ friendshipId }),
      this.friendshipModel.deleteOne({
        _id: friendshipId,
      }),
    ]);

    this.socketIoService.friendshipDeleted(
      userId === friendship.user1Id ? friendship.user2Id : friendship.user1Id,
      friendshipId
    );
  }
}
