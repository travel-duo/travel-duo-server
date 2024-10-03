import { ApiProperty } from '@nestjs/swagger';

export class WeatherForecast {
  @ApiProperty({ description: 'Forecast date and time', example: '202309150600' })
  date: string;

  @ApiProperty({ description: 'Temperature in Celsius', example: 25.5 })
  temperature: number;

  @ApiProperty({ description: 'Humidity percentage', example: 60 })
  humidity: number;
}

export interface WeatherClient {
  getShortTermForecast(nx: number, ny: number, baseDate: string, baseTime: string): Promise<WeatherForecast[]>;
  getTodayForecast(nx: number, ny: number): Promise<WeatherForecast[]>;
}