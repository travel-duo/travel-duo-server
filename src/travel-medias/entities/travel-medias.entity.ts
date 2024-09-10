import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Travels } from '@/travels/entities/travels.entity';
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
  travelId: Travels;

  @ManyToOne(() => Users, (users) => users.travelMedias)
  creatorId: Users;
}
