import { ApiProperty } from '@nestjs/swagger';

export class UpdateTravelDto {
  @ApiProperty({
    example: 1,
    description: 'The id of the travel',
  })
  id: bigint;

  @ApiProperty({
    example: true,
    description: 'The shared status of the travel',
  })
  isShared: boolean;

  @ApiProperty({
    example: 'icon',
    description: 'The icon of the travel',
  })
  icon: string;

  @ApiProperty({
    example: 'title',
    description: 'The title of the travel',
  })
  title: string;

  @ApiProperty({
    example: 'description',
    description: 'The description of the travel',
  })
  description: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'The start date of the travel',
  })
  startDate: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00Z',
    description: 'The end date of the travel',
  })
  endDate: Date;
}
