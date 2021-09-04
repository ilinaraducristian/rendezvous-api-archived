import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('friendships')
export class FriendshipEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  user1_id: string;

  @Column({ nullable: false })
  user2_id: string;

}
