import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { WeatherClientFactory, WeatherServiceType } from './weather-client.factory';
import { WeatherForecast } from './interface/weather-client.interface';

@ApiTags('weather')
@Controller({ path: 'weather', version: '1' })
export class WeatherController {
  constructor(private weatherClientFactory: WeatherClientFactory) {}

  @Get('forecast')
  @ApiOperation({ summary: 'Get today\'s weather forecast' })
  @ApiQuery({ name: 'nx', type: Number, description: 'X coordinate' })
  @ApiQuery({ name: 'ny', type: Number, description: 'Y coordinate' })
  @ApiResponse({ status: 200, description: 'Successful.', type: [WeatherForecast] })
  async getForecast(
    @Query('nx') nx: string,
    @Query('ny') ny: string
  ): Promise<WeatherForecast[]> {
    const weatherClient = this.weatherClientFactory.getClient(WeatherServiceType.WEATHER);
    return weatherClient.getTodayForecast(parseInt(nx), parseInt(ny));
  }

  @Get('short-term')
  @ApiOperation({ summary: 'Get short-term weather forecast' })
  @ApiQuery({ name: 'nx', type: Number, description: 'X coordinate' })
  @ApiQuery({ name: 'ny', type: Number, description: 'Y coordinate' })
  @ApiQuery({ name: 'baseDate', type: String, description: 'Base date (YYYYMMDD)' })
  @ApiQuery({ name: 'baseTime', type: String, description: 'Base time (HHMM)' })
  @ApiResponse({ status: 200, description: 'Successful.', type: [WeatherForecast] })
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