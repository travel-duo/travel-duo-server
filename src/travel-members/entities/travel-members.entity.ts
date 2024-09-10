import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Travels } from '@/travels/entities/travels.entity';
import { Users } from '@/user/entities/users.entity';

@Entity('travel_members')
export class TravelMembers {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Travels, (travels) => travels.travelMembers)
  travelId: Travels;

  @ManyToOne(() => Users, (user) => user.travelMembers)
  userId: Users;
}
