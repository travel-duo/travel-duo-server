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
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';

@Entity('town_cities')
export class TownCities {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'double precision', nullable: true })
  lon: number;

  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => CountryStates, (countryState) => countryState.townCities)
  @JoinColumn({ name: 'country_state_id' })
  countryState: CountryStates;

  @OneToMany(() => TravelLocations, (locations) => locations.townCities)
  locations: TravelLocations[];
}
