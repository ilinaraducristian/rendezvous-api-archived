import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelType } from '../models/channel.model';

@Entity('channels')
export class ChannelEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  server_id: number;

  @Column()
  group_id: number;

  @Column({ nullable: false })
  type: ChannelType;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  order: number;

}
