import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { Gender } from '@/user/enums/gender.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: '사용자 이름',
    example: 'john_doe',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '실명',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '전화번호',
    example: '+82-10-1234-5678',
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: '주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: '생년월일',
    example: '1990-01-01',
  })
  @IsDate()
  @IsOptional()
  birth?: Date;

  @ApiProperty({
    description: '성별',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: '이용약관 동의 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  termsAgreement?: boolean;

  @ApiProperty({
    description: '마케팅 수신 동의 여부',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @ApiProperty({
    description: '삭제 여부',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDel?: boolean;
}
