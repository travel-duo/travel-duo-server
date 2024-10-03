import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'testuser',
    description: 'The username of the User',
  })
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the User',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the User',
  })
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'The role of the User',
  })
  name: string;
}
