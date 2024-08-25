import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일 주소 또는 관리자 아이디',
  })
  @IsString({ message: '유효한 이메일 주소나 아이디를 입력해주세요.' })
  @Matches(
    /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|admin|admin.*)$/,
    {
      message: '유효한 이메일 주소나 관리자 아이디를 입력해주세요.',
    },
  )
  email: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  @IsString()
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;
}
