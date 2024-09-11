import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Users } from '@/user/entities/users.entity';
import { TravelMedias } from '@/travel/entities/travel-medias.entity';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { TravelDetails } from '@/travel/entities/travel-details.entity';

@Entity('travels')
export class Travels {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.travels)
  @JoinColumn({ name: 'creator_id' })
  creator: Users;

  @OneToMany(() => TravelMembers, (travelMembers) => travelMembers.travel)
  travelMembers: TravelMembers[];

  @OneToMany(() => TravelMedias, (travelMedia) => travelMedia.travel)
  travelMedias: TravelMedias[];

  @OneToMany(() => TravelDetails, (travelDetails) => travelDetails.travel)
  travelDetails: TravelDetails[];
}
