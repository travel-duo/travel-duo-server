import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany, JoinColumn,
} from 'typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';

@Entity('travel_details')
export class TravelDetails {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
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

  @ManyToOne(() => Travels, (travels) => travels.travelDetails)
  @JoinColumn({ name: 'travel_id' })
  travel: Travels;

  @OneToMany(() => TravelLocations, (locations) => locations.travelDetails)
  locations: TravelLocations[];
}
