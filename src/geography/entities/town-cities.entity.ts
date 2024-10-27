import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { Travels } from '@/travel/entities/travels.entity';

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

  @ManyToMany(() => Travels, (travels) => travels.townCities)
  travels: Travels[];
}
