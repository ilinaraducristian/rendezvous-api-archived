import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('groups')
export class GroupEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  server_id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  order: number;

}
