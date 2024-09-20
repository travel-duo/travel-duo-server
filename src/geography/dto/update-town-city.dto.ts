import { ApiProperty } from '@nestjs/swagger';

export class UpdateTownCityDto {
  @ApiProperty({
    example: 1,
    description: 'The id of the TownCity',
  })
  id: bigint;

  @ApiProperty({
    example: '하남시',
    description: 'The name of the TownCity',
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
    example: 2,
    description: 'The id of the country state',
  })
  countryStateId: bigint;
}
