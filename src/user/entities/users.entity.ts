import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelMedias } from '@/travel/entities/travel-medias.entity';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { Badges } from '@/badge/entities/badges.entity';
import { Gender } from '@/user/enums/gender.enum';
import { UserRole } from '@/user/enums/user-role.enum';

@Entity('users')
@Unique(['email', 'oauthType'])
export class Users {
  @PrimaryGeneratedColumn('increment')
  _id: bigint;

  @Column({ type: 'varchar' })
  oauthType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  nickName: string;

  @Column({ type: 'timestamp', nullable: true })
  birth?: Date;

  @Column({ type: 'varchar', nullable: true })
  gender?: Gender;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  role?: UserRole;

  @Column({ type: 'varchar', nullable: true })
  profile: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  isDel: boolean;

  @Column({ default: true })
  termsAgreement?: boolean;

  @Column({ default: false })
  marketingConsent?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Travels, (travels) => travels.creator)
  travels: Travels[];

  @OneToMany(() => TravelMedias, (travelMedia) => travelMedia.creator)
  travelMedias: TravelMedias[];

  @OneToMany(() => TravelMembers, (travelMembers) => travelMembers.user)
  travelMembers: TravelMembers[];

  @OneToMany(() => Badges, (badges) => badges.user)
  badges: Badges[];
}
