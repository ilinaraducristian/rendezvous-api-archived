import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ServerEntity } from './server.entity';

@Entity('members')
export class MemberEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  server_id: number;

  @Column({ nullable: false })
  user_id: string;

  @ManyToOne(() => ServerEntity, server => server.members)
  server: ServerEntity;

}
