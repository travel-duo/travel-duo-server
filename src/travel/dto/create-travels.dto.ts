import { ApiProperty } from '@nestjs/swagger';

export class CreateTravelsDto {
  @ApiProperty({
    example: false,
    description: 'shared status of the travel',
  })
  isShared: boolean;

  @ApiProperty({
    example: 'icon',
    description: 'icon of the travel',
  })
  icon: string;

  @ApiProperty({
    example: 'title',
    description: 'title of the travel',
  })
  title: string;

  @ApiProperty({
    example: 'description',
    description: 'description of the travel',
  })
  description: string;

  @ApiProperty({
    example: '2024-02-01T00:00:00',
    description: 'start date of the travel',
  })
  startDate: Date;

  @ApiProperty({
    example: '2024-02-02T00:00:00',
    description: 'end date of the travel',
  })
  endDate: Date;

  @ApiProperty({
    example: 1,
    description: 'creator id of the travel',
  })
  creatorId: bigint;
}
