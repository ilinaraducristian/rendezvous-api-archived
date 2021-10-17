import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MemberEntity } from './member.entity';

@Entity('servers')
export class ServerEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  user_id: string;

  @Column()
  image_md5: string | null;

  @Column()
  invitation: string | null;

  @Column()
  invitation_exp: string | null;

  @OneToMany(() => MemberEntity, member => member.server)
  members: MemberEntity[];

}
