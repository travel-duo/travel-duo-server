import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TravelDetails } from '@/travel-details/entities/travel-details.entity';
import { Category } from '@/locations/enums/category';
import { TownCities } from '@/town-cities/entities/town-cities.entity';

@Entity('locations')
export class Locations {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar', nullable: true })
  category: Category;

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

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => TravelDetails, (travelDetails) => travelDetails.locations)
  travelDetailId: TravelDetails;

  @ManyToOne(() => TownCities, (townCities) => townCities.locations)
  townCityId: TownCities;
}
