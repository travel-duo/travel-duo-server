import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Travels } from '@/travels/entities/travels.entity';
import { Locations } from '@/locations/entities/locations.entity';

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

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Travels, (travels) => travels.travelDetails)
  travel: Travels;

  @OneToMany(() => Locations, (locations) => locations.travelDetails)
  locations: Locations[];
}
