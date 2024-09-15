import { Controller, Get, Query } from '@nestjs/common';
import { WeatherClientFactory, WeatherServiceType } from '@/weather-client/weather-client.factory';
import { WeatherForecast } from '@/weather-client/interface/weather-client.interface';

@Controller('weather')
export class WeatherController {
  constructor(private weatherClientFactory: WeatherClientFactory) {}

  @Get('forecast')
  async getForecast(
    @Query('nx') nx: string,
    @Query('ny') ny: string
  ): Promise<WeatherForecast[]> {
    const weatherClient = this.weatherClientFactory.getClient(WeatherServiceType.WEATHER);
    return weatherClient.getTodayForecast(parseInt(nx), parseInt(ny));
  }

  @Get('short-term')
  async getShortTermForecast(
    @Query('nx') nx: string,
    @Query('ny') ny: string,
    @Query('baseDate') baseDate: string,
    @Query('baseTime') baseTime: string
  ): Promise<WeatherForecast[]> {
    const weatherClient = this.weatherClientFactory.getClient(WeatherServiceType.WEATHER);
    return weatherClient.getShortTermForecast(parseInt(nx), parseInt(ny), baseDate, baseTime);
  }
}