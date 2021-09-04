import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class MessageEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  friendship_id: number | null;

  @Column()
  server_id: number | null;

  @Column()
  channel_id: number | null;

  @Column({ nullable: false })
  user_id: string;

  @Column({ nullable: false })
  timestamp: string;

  @Column({ nullable: false })
  text: string;

  @Column({ nullable: false })
  is_reply: boolean;

  @Column()
  reply_id: number | null;

  @Column()
  image_md5: string;

}
