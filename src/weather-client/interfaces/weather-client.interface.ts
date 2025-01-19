import { ApiProperty } from '@nestjs/swagger';

export class CurrentWeather {
  @ApiProperty({
    description: 'Announced date and time',
    example: '202309150600',
  })
  date: string;

  @ApiProperty({ description: 'Location name', example: '서울특별시' })
  location: string;

  @ApiProperty({ description: 'Temperature in Celsius', example: 25.5 })
  temp: number;

  @ApiProperty({ description: 'Low temperature in Celsius', example: 18 })
  minTemp: number;

  @ApiProperty({ description: 'High temperature in Celsius', example: 24 })
  maxTemp: number;

  @ApiProperty({ description: 'Sky status', example: '맑음' })
  sky: string;
}

export class WeatherForecast {
  @ApiProperty({
    description: 'Forecast date and time',
    example: '202309150600',
  })
  date: string;

  @ApiProperty({ description: 'Low temperature in Celsius', example: 18 })
  minTemp: number;

  @ApiProperty({ description: 'High temperature in Celsius', example: 24 })
  maxTemp: number;

  @ApiProperty({ description: 'Sky status', example: '맑음' })
  amSky: string;

  @ApiProperty({ description: 'Sky status', example: '맑음' })
  pmSky: string;
}

export interface WeatherClient {
  getCurrentWeather(lon: number, lat: number): Promise<CurrentWeather>;

  getShortTermForecast(lon: number, lat: number): Promise<WeatherForecast[]>;

  getMidTermForecast(lon: number, lat: number): Promise<WeatherForecast[]>;
}
