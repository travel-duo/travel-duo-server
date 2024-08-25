import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StreamChatDto {
  @ApiProperty({
    description: 'The message to be processed by the chatbot',
    example: 'What is the main topic of this video?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
