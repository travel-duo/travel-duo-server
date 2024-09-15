import { ApiProperty } from '@nestjs/swagger';

export class CreateTravelDetailsDto {
  @ApiProperty({
    example: 'icon',
    description: 'icon of the travel detail',
  })
  icon: string;

  @ApiProperty({
    example: 'title',
    description: 'title of the travel detail',
  })
  title: string;

  @ApiProperty({
    example: 'description',
    description: 'description of the travel detail',
  })
  description: string;

  @ApiProperty({
    example: '2024-02-01T00:00:00',
    description: 'start date of the travel detail',
  })
  startDate: Date;

  @ApiProperty({
    example: '2024-02-02T00:00:00',
    description: 'end date of the travel detail',
  })
  endDate: Date;

  @ApiProperty({
    example: 1,
    description: 'travel id of the travel detail',
  })
  travelId: bigint;
}
