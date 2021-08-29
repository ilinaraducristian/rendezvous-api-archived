import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('friend_requests')
export class FriendRequestEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user1_id: string;

  @Column({ nullable: false })
  user2_id: string;

  @Column({ nullable: false })
  status: string;

}
