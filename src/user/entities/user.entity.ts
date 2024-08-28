import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Exclude } from 'class-transformer';
import { Gender } from '@/user/enums/gender.enum';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'number', precision: 10, scale: 0 })
  @Generated('increment')
  _id: number;

  @Column({ unique: true, length: 50, nullable: true })
  username: string;

  @Column({ unique: true, length: 100, nullable: false })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'timestamp', nullable: true })
  birth?: Date;

  @Column({
    type: 'varchar2',
    length: 10,
    default: Gender.OTHER,
  })
  gender?: Gender;

  @Column({
    type: 'varchar2',
    length: 10,
    default: UserRole.STUDENT,
  })
  @Index()
  role?: UserRole;

  @Column({ default: true })
  termsAgreement?: boolean;

  @Column({ default: false })
  marketingConsent?: boolean;

  @Column({ default: false })
  isDel: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
