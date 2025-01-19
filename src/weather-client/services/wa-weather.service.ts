import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as dayjs from 'dayjs';
import {
  CurrentWeather,
  WeatherClient,
  WeatherForecast,
} from '@/weather-client/interfaces/weather-client.interface';
import {
  LocalClientFactory,
  LocalClientType,
} from '@/local-client/local-client.factory';

/**
 * WeatherAPI(https://api.weatherapi.com)에 맞춰
 * WeatherClient 인터페이스를 구현한 예시 서비스
 */
@Injectable()
export class WaWeatherService implements WeatherClient {
  private readonly logger = new Logger(WaWeatherService.name);
  private readonly apiEndpoint: string;
  private readonly apiKey: string;
  private readonly axios: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private localClientFactory: LocalClientFactory,
  ) {
    // .env 등에서 WeatherAPI 관련 설정을 불러온다고 가정
    this.apiEndpoint = this.configService.get<string>(
      'WA_WEATHER_API_ENDPOINT',
    );
    this.apiKey = this.configService.get<string>('WA_WEATHER_SERVICE_KEY');

    if (!this.apiEndpoint || !this.apiKey) {
      throw new Error(
        'Weather API configuration is missing for WeatherAPI.com',
      );
    }

    this.axios = axios.create({
      baseURL: this.apiEndpoint,
    });
  }

  /**
   * getCurrentWeather
   * - WeatherAPI의 forecast.json을 호출하여 현재 기온(temp_c), 하늘상태(condition.text),
   *   그리고 오늘(min/max) 기온 등을 파싱한 뒤 CurrentWeather 형태로 반환
   */
  async getCurrentWeather(lon: number, lat: number): Promise<CurrentWeather> {
    try {
      // 1) 좌표 → 주소 문자열 변환 (Kakao local 등)
      const locationName = await this._getLocationString(lon, lat);

      const forecastResponse = await this.axios.get('/forecast.json', {
        params: {
          key: this.apiKey,
          q: `${lat},${lon}`, // lat,lon 순서 가능(WeatherAPI는 q=위도,경도 문자열도 허용)
          days: 1,
          hour: -1,
        },
      });
      const current = forecastResponse.data?.current;

      const forecast = forecastResponse.data?.forecast?.forecastday?.find(
        (item) => {
          return dayjs(item.date).isSame(dayjs(), 'day');
        },
      );

      // 3) 응답 파싱
      const dateStr = dayjs(current?.last_updated).format('YYYYMMDDHHmm');
      const temp = current?.temp_c ?? -999;
      const sky = current?.condition?.text ?? 'Unknown';
      const minTemp = forecast.day?.mintemp_c ?? -999;
      const maxTemp = forecast.day?.maxtemp_c ?? -999;

      return {
        location: locationName,
        date: dateStr,
        temp,
        minTemp,
        maxTemp,
        sky,
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch current weather from WeatherAPI',
        error,
      );
      throw error;
    }
  }

  /**
   * getShortTermForecast
   * - WeatherAPI에서 최대 3~7일 예보를 호출해 단기 예보라 가정
   * - forecastday 배열을 순회하며 날짜별 min/max/하늘상태를 추출
   */
  async getShortTermForecast(
    lon: number,
    lat: number,
  ): Promise<WeatherForecast[]> {
    try {
      // 필요하다면 위치 문자열 파싱
      // const locationName = await this._getLocationString(lon, lat);

      // days=3으로 3일치 예보
      const response = await this.axios.get('/forecast.json', {
        params: {
          key: this.apiKey,
          q: `${lat},${lon}`,
          days: 3,
        },
      });

      const data = response.data;
      const forecastDays = data?.forecast?.forecastday ?? [];

      const results: WeatherForecast[] = forecastDays.map((dayItem: any) => {
        const date = dayItem.date; // 예: '2025-01-20'
        const dayInfo = dayItem.day;
        const minTemp = dayInfo?.mintemp_c ?? -999;
        const maxTemp = dayInfo?.maxtemp_c ?? -999;
        const skyText = dayInfo?.condition?.text ?? '';

        return {
          date,
          minTemp,
          maxTemp,
          amSky: skyText,
          pmSky: skyText,
        };
      });

      return results;
    } catch (error) {
      this.logger.error(
        'Failed to fetch shortTerm forecast from WeatherAPI',
        error,
      );
      throw error;
    }
  }

  /**
   * getMidTermForecast
   * - WeatherAPI는 무료 플랜 기준 최대 10일치 예보를 제공.
   * - 여기서는 day 4~10 정도를 중기 예보로 간주해 반환하는 예시입니다.
   */
  async getMidTermForecast(
    lon: number,
    lat: number,
  ): Promise<WeatherForecast[]> {
    try {
      // days=10 으로 10일치 예보 요청
      // (만약 API 플랜이 7일까지만 제공한다면, day 4~7만 사용)
      const response = await this.axios.get('/forecast.json', {
        params: {
          key: this.apiKey,
          q: `${lat},${lon}`,
          days: 10,
        },
      });

      const data = response.data;
      const forecastDays = data?.forecast?.forecastday ?? [];

      // 예: [ day0, day1, day2, ... ] 중 day3 ~ day9(총 7일) 정도를 중기라고 가정
      // 인덱스 주의: 3번째 인덱스부터 9번째 인덱스(실제 최대 길이를 초과하지 않도록)
      const results: WeatherForecast[] = [];
      for (let i = 3; i < forecastDays.length && i <= 9; i++) {
        const fday = forecastDays[i];
        const date = fday.date;
        const dayData = fday.day;
        const minTemp = dayData?.mintemp_c ?? -999;
        const maxTemp = dayData?.maxtemp_c ?? -999;
        const sky = dayData?.condition?.text ?? '';

        results.push({
          date,
          minTemp,
          maxTemp,
          amSky: sky,
          pmSky: sky,
        });
      }

      return results;
    } catch (error) {
      this.logger.error(
        'Failed to fetch midTerm forecast from WeatherAPI',
        error,
      );
      // 중기 예보는 강제 의무가 아니므로, 에러 발생 시 빈 배열 반환
      return [];
    }
  }

  /**
   * (공통) 좌표 → 행정구역명 변환 (Kakao Local 등)
   * - Kakao 로컬 API를 이용해 region_1depth_name, region_2depth_name 등을 조합
   */
  private async _getLocationString(lon: number, lat: number): Promise<string> {
    try {
      const localService = this.localClientFactory.getClient(
        LocalClientType.KAKAO,
      );
      const addressResponse = await localService.coordToAddress(lon, lat);
      const region = addressResponse?.documents?.[0];

      if (!region) {
        return 'Unknown Location';
      }

      const region1 = region.address?.region_1depth_name ?? '';
      const region2 = region.address?.region_2depth_name ?? '';
      return `${region1} ${region2}`.trim();
    } catch (error) {
      this.logger.error('Failed to get location from localService', error);
      return 'Unknown Location';
    }
  }
}
