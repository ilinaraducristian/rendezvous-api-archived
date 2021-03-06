import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import FriendRequestStatus from '../models/friend-request-status.model';

@Entity('friend_requests')
export class FriendRequestEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user1_id: string;

  @Column({ nullable: false })
  user2_id: string;

  @Column({ nullable: false })
  status: FriendRequestStatus;

}
