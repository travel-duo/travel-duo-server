import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryStateDto {
  @ApiProperty({
    example: '경기도',
    description: 'The name of the CountryState',
  })
  name: string;
}
