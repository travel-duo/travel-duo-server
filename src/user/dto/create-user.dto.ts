import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { Gender } from '@/user/enums/gender.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'testuser',
    description: 'The username of the User',
  })
  username?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the User',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the User',
  })
  password?: string;

  @ApiProperty({
    example: 'google',
    description: 'The login type (e.g. google, facebook)',
  })
  oauthType?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the User',
  })
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the User',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'The address of the User',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'The birth date of the User',
  })
  birth?: Date;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'The gender of the User',
  })
  gender?: Gender;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'The role of the User',
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether the User agrees to the terms',
    default: true,
  })
  termsAgreement?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the User consents to marketing',
    default: false,
  })
  marketingConsent?: boolean;
}
