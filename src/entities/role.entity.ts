import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class RoleEntity {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  server_id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  rename_server: boolean;

  @Column({ nullable: false })
  create_invitation: boolean;

  @Column({ nullable: false })
  delete_server: boolean;

  @Column({ nullable: false })
  create_channels: boolean;

  @Column({ nullable: false })
  create_groups: boolean;

  @Column({ nullable: false })
  delete_channels: boolean;

  @Column({ nullable: false })
  delete_groups: boolean;

  @Column({ nullable: false })
  move_channels: boolean;

  @Column({ nullable: false })
  move_groups: boolean;

  @Column({ nullable: false })
  read_messages: boolean;

  @Column({ nullable: false })
  write_messages: boolean;

}
