import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('USER_ENTITY')
export class UserEntity {

  @PrimaryGeneratedColumn()
  ID: string;

  @Column({ nullable: false })
  USERNAME: string;

  @Column({ nullable: false })
  FIRST_NAME: string;

  @Column({ nullable: false })
  LAST_NAME: string;

}
