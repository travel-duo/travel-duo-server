import { LocationType } from '@/travel/enums/location-type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTravelLocationsDto {
  @ApiProperty({
    example: 'cafe',
    description: 'type of the travel location',
  })
  locationType: LocationType;

  @ApiProperty({
    example: 'icon',
    description: 'icon of the travel location',
  })
  icon: string;

  @ApiProperty({
    example: 'title',
    description: 'title of the travel location',
  })
  title: string;

  @ApiProperty({
    example: 'description',
    description: 'description of the travel location',
  })
  description: string;

  @ApiProperty({
    example: 'address',
    description: 'address of the travel location',
  })
  address?: string;

  @ApiProperty({
    example: '127.1266546',
    description: 'longitude of the town city',
  })
  lon?: number;

  @ApiProperty({
    example: '37.420023',
    description: 'latitude of the town city',
  })
  lat?: number;

  @ApiProperty({
    example: '1',
    description: 'The order index of the travel location',
  })
  orderIndex: number;

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
    description: 'id of the travel detail',
  })
  travelDetailId: bigint;

  @ApiProperty({
    example: 1,
    description: 'id of the town city',
  })
  townCityId: bigint;
}
