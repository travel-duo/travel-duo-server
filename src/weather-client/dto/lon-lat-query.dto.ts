// get-weather.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class LonLatQueryDto {
  @IsNotEmpty({ message: 'lon 파라미터는 필수입니다.' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lon: number;

  @IsNotEmpty({ message: 'lat 파라미터는 필수입니다.' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lat: number;
}
