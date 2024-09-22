import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FlutterLoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일 주소',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: '사용자 이름' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  name: string;

  @ApiProperty({
    example: 'email',
    description: '로그인 유형 (예: google, facebook)',
  })
  @IsString({ message: '로그인 유형은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '로그인 유형은 필수 입력 항목입니다.' })
  oauthType: string;
}
