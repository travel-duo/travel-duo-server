import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { Users } from '@/user/entities/users.entity';

@Entity('travel_medias')
export class TravelMedias {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar', nullable: true })
  filePath: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Travels, (travels) => travels.travelMedias)
  @JoinColumn({ name: 'travel_id' })
  travel: Travels;

  @ManyToOne(() => Users, (users) => users.travelMedias)
  @JoinColumn({ name: 'creator_id' })
  creator: Users;
}
