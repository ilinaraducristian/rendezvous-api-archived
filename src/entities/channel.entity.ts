import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channels')
export class ChannelEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  server_id: number;

  @Column()
  group_id: number;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  order: number;

}
