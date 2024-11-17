import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WeatherApiService } from './weather-api.service';
import { UserGuard } from '@/auth/guards/user.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller({
  path: 'weather-api',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('weather-api')
export class WeatherAPIController {
  constructor(private readonly weatherService: WeatherApiService) {}

  // 특정 지역의 일주일치 날씨 정보 제공
  @Get('weekly/:region')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '일주일 날씨 데이터 조회' })
  @ApiResponse({
    status: 200,
    description: '일주일 날씨 데이터 조회 성공',
  })
  async getWeeklyWeather(@Param('region') region: string) {
    try {
      return await this.weatherService.getWeeklyWeather(region);
    } catch (error) {
      console.error('Error fetching weekly weather:', error.message);
      throw new HttpException(
        'Failed to retrieve weather data. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('today/:region')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 지역 오늘 날씨 데이터 조회' })
  @ApiResponse({
    status: 200,
    description: '오늘 날씨 데이터 조회 성공',
  })
  async getTodayWeather(@Param('region') region: string) {
    try {
      return this.weatherService.getTodayWeather(region);
    } catch (error) {
      console.error('Error fetching weekly weather:', error.message);
      throw new HttpException(
        'Failed to retrieve weather data. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
