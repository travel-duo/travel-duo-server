import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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
  userId: Users;
}
