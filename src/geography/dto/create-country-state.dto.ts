import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryStateDto {
  @ApiProperty({
    example: '서울특별시',
    description: 'The name of the CountryState',
  })
  name: string;
}
