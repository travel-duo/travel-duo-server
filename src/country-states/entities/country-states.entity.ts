import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TownCities } from '@/town-cities/entities/town-cities.entity';

@Entity('country_states')
export class CountryStates {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => TownCities, (townCities) => townCities.countryState)
  townCities: TownCities[];
}
