import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { LocationType } from '@/travel/enums/location-type';
import { TownCities } from '@/geography/entities/town-cities.entity';

@Entity('travel_locations')
export class TravelLocations {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar', nullable: true })
  locationType: LocationType;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'double precision', nullable: true })
  lon: number;

  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @Column({ type: 'int', nullable: true })
  orderIndex: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => TravelDetails, (travelDetails) => travelDetails.locations)
  @JoinColumn({ name: 'travel_details_id' })
  travelDetails: TravelDetails;

  @ManyToOne(() => TownCities, (townCities) => townCities.locations)
  @JoinColumn({ name: 'town_cities_id' })
  townCities: TownCities;
}
