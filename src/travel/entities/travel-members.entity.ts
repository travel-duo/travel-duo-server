import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { Users } from '@/user/entities/users.entity';

@Entity('travel_members')
export class TravelMembers {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @ManyToOne(() => Users, (user) => user.travelMembers)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Travels, (travels) => travels.travelMembers)
  @JoinColumn({ name: 'travel_id' })
  travel: Travels;
}
