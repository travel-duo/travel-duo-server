import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  WeatherClientFactory,
  WeatherServiceType,
} from './weather-client.factory';
import {
  CurrentWeather,
  WeatherForecast,
} from '@/weather-client/interfaces/weather-client.interface';
import { LonLatQueryDto } from '@/weather-client/dto/lon-lat-query.dto';

@ApiTags('weather')
@Controller({ path: 'weather', version: '1' })
export class WeatherController {
  constructor(private weatherClientFactory: WeatherClientFactory) {}

  @Get('current')
  @ApiOperation({ summary: '현재 날씨 정보를 가져옵니다.' })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiResponse({ status: 200, type: CurrentWeather })
  async getCurrentWeather(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: LonLatQueryDto,
  ): Promise<CurrentWeather> {
    const client = this.weatherClientFactory.getClient(WeatherServiceType.WA);
    return client.getCurrentWeather(query.lon, query.lat);
  }

  @Get('forecast/short')
  @ApiOperation({ summary: '단기 예보 정보를 가져옵니다.' })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiResponse({ status: 200, type: WeatherForecast, isArray: true })
  async getShortTermForecast(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: LonLatQueryDto,
  ): Promise<WeatherForecast[]> {
    const client = this.weatherClientFactory.getClient(WeatherServiceType.KMA);
    return client.getShortTermForecast(query.lon, query.lat);
  }

  @Get('forecast/mid')
  @ApiOperation({ summary: '중기 예보 정보를 가져옵니다.' })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiResponse({ status: 200, type: WeatherForecast, isArray: true })
  async getMidTermForecast(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: LonLatQueryDto,
  ): Promise<WeatherForecast[]> {
    const client = this.weatherClientFactory.getClient(WeatherServiceType.KMA);
    return client.getMidTermForecast(query.lon, query.lat);
  }
}
