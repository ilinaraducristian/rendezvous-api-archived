import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servers')
export class ServerEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  user_id: string;

  @Column()
  invitation: string | null;

  @Column()
  invitation_exp: string | null;

}
