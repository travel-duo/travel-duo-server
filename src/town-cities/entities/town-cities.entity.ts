import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CountryStates } from '@/country-states/entities/country-states.entity';
import { Locations } from '@/locations/entities/locations.entity';

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

  @OneToMany(() => Locations, (locations) => locations.townCityId)
  locations: Locations[];

  @ManyToOne(() => CountryStates, (countryState) => countryState.townCities)
  countryStateId: CountryStates;
}
