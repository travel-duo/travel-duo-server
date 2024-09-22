import { ApiProperty } from '@nestjs/swagger';

export class CreateTownCityDto {
  @ApiProperty({
    example: '성남시',
    description: 'The name of the town city',
  })
  name: string;

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
    description: 'The id of the country state',
  })
  countryStateId: bigint;
}
