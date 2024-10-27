import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '@/user/entities/users.entity';
import { TravelMedias } from '@/travel/entities/travel-medias.entity';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';

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

  @Column({ type: 'timestamp with time zone', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
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

  @ManyToMany(() => TownCities, (townCities) => townCities.travels)
  @JoinTable({
    name: 'travels_town_cities', // 중간 테이블 이름
    joinColumn: {
      name: 'travel_id',
      referencedColumnName: '_id',
    },
    inverseJoinColumn: {
      name: 'town_city_id',
      referencedColumnName: '_id',
    },
  })
  townCities: TownCities[];
}
