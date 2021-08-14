import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class MessageEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  server_id: number;

  @Column({ nullable: false })
  channel_id: number;

  @Column({ nullable: false })
  user_id: string;

  @Column({ nullable: false })
  timestamp: string;

  @Column({ nullable: false })
  text: string;

}
