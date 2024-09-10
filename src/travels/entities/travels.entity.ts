import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Users } from '@/user/entities/users.entity';
import { TravelMedias } from '@/travel-medias/entities/travel-medias.entity';
import { TravelMembers } from '@/travel-members/entities/travel-members.entity';
import { TravelDetails } from '@/travel-details/entities/travel-details.entity';

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

  @OneToMany(() => TravelMembers, (travelMembers) => travelMembers.travelId)
  travelMembers: TravelMembers[];

  @OneToMany(() => TravelMedias, (travelMedia) => travelMedia.travelId)
  travelMedias: TravelMedias[];

  @OneToMany(() => TravelDetails, (travelDetails) => travelDetails.travelId)
  travelDetails: TravelDetails[];

  @ManyToOne(() => Users, (user) => user.travels)
  creatorId: Users;
}
