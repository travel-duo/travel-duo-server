import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTravelMembersDto {
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the travel',
  })
  id: bigint;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the user',
  })
  userId: bigint;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the travel',
  })
  travelId: bigint;
}
