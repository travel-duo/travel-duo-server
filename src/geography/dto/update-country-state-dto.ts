import { ApiProperty } from '@nestjs/swagger';

export class UpdateCountryStateDto {
  @ApiProperty({
    example: 1,
    description: 'The id of the CountryState',
  })
  id: bigint;

  @ApiProperty({
    example: '경기도',
    description: 'The name of the CountryState',
  })
  name: string;
}
