import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Users } from '@/user/entities/users.entity';

@Entity('badges')
export class Badges {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  imagePath: string;

  @ManyToOne(() => Users, (user) => user.badges)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
