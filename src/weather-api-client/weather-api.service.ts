// weather-api.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import * as dayjs from 'dayjs';
import {
  LocationCoordinates,
  MidTermForecastRegion,
} from './weather-api.enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherApiService {
  private readonly weatherApiKey: string;

  constructor(private configService: ConfigService) {
    this.weatherApiKey = this.configService.get<string>('WEATHER_SERVICE_KEY');

    if (!this.weatherApiKey) {
      throw new Error('Weather API configuration is missing');
    }
  }

  async getTodayWeather(locationName: string) {
    // 지역명에 해당하는 좌표 가져오기
    const location = LocationCoordinates[locationName.toUpperCase()];
    if (!location) {
      throw new NotFoundException(`Location ${locationName} not found`);
    }

    // API 호출 URL 및 파라미터 설정
    const baseDate = this.getCurrentDate();
    const baseTime = this.getNearestPastBaseTime();
    const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`;
    const params = {
      serviceKey: this.weatherApiKey,
      numOfRows: 500,
      pageNo: 1,
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: location.nx,
      ny: location.ny,
    };

    // API 호출 및 데이터 가공
    try {
      const response = await axios.get(url, { params, timeout: 5000 }); // 5초 타임아웃 설정
      const items = response?.data?.response?.body?.items?.item;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid data received from weather API');
      }

      const todayItems = items.filter(
        (item) =>
          item.fcstDate === this.getCurrentDate() &&
          (item.category === 'TMP' ||
            item.category === 'SKY' ||
            item.category === 'PTY'),
      );

      const weatherData = this.processWeatherData(todayItems, baseTime);
      return {
        locationName,
        currentTemperature: weatherData.currentTemperature,
        maxTemperature: weatherData.maxTemperature,
        minTemperature: weatherData.minTemperature,
        skyStatus: weatherData.skyStatus,
      };
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new InternalServerErrorException('Weather API request timed out');
      } else if (error.message === 'Invalid data received from weather API') {
        throw new InternalServerErrorException(
          'Received invalid data from Weather API',
        );
      } else {
        throw new InternalServerErrorException('Failed to fetch weather data');
      }
    }
  }

  public getCurrentDate(): string {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();

    // 00:00 ~ 02:10인 경우 전날 날짜 반환
    if (hour < 2 || (hour === 2 && minute <= 10)) {
      return now.subtract(1, 'day').format('YYYYMMDD');
    } else {
      return now.format('YYYYMMDD');
    }
  }

  // HHMM을 반환하는 메서드
  public getNearestPastBaseTime(): string {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();

    if (hour < 2 || (hour === 2 && minute <= 10)) return '2300';
    if (hour < 5 || (hour === 5 && minute <= 10)) return '0200';
    if (hour < 8 || (hour === 8 && minute <= 10)) return '0500';
    if (hour < 11 || (hour === 11 && minute <= 10)) return '0800';
    if (hour < 14 || (hour === 14 && minute <= 10)) return '1100';
    if (hour < 17 || (hour === 17 && minute <= 10)) return '1400';
    if (hour < 20 || (hour === 20 && minute <= 10)) return '1700';
    if (hour < 23 || (hour === 23 && minute <= 10)) return '2000';
    return '2300';
  }

  private processWeatherData(items, baseTime: string): any {
    let currentTemperature = null;
    let maxTemperature = null;
    let minTemperature = null;
    let skyStatus = null;

    // TMP 온도 데이터 필터링을 위해 사용할 배열
    const temperatures = [];

    // PTY 값을 저장할 변수
    let ptyValue = null;

    items.forEach((item) => {
      const { category, fcstValue, fcstTime } = item;

      if (category === 'TMP') {
        const temperature = parseFloat(fcstValue);

        // fcstTime이 baseTime보다 1시간 많은 경우에만 현재 온도로 설정
        if (
          currentTemperature === null &&
          fcstTime === this.addOneHour(baseTime)
        ) {
          currentTemperature = temperature;
        }

        // TMP 값들을 배열에 추가하여 최고/최저 온도 판단에 사용
        temperatures.push(temperature);
      }

      if (category === 'SKY' && fcstTime === this.addOneHour(baseTime)) {
        skyStatus = fcstValue; // SKY 상태 값 저장
      }

      if (category === 'PTY' && fcstTime === this.addOneHour(baseTime)) {
        ptyValue = fcstValue; // PTY 상태 값 저장
      }
    });

    // 최고 온도와 최저 온도 설정
    if (temperatures.length > 0) {
      maxTemperature = Math.max(...temperatures);
      minTemperature = Math.min(...temperatures);
    }

    return {
      currentTemperature,
      maxTemperature,
      minTemperature,
      skyStatus: this.getSkyStatus(skyStatus, ptyValue),
    };
  }

  // baseTime에 1시간을 더해 반환하는 메서드
  private addOneHour(baseTime: string): string {
    const hour = parseInt(baseTime.slice(0, 2), 10) + 1;
    return hour.toString().padStart(2, '0') + '00';
  }

  private getSkyStatus(skyValue: string, ptyValue: string): string {
    if (ptyValue === '1') return '비';
    if (ptyValue === '2') return '비/눈';
    if (ptyValue === '3') return '눈';
    if (ptyValue === '4') return '소나기';

    switch (skyValue) {
      case '1':
        return '맑음';
      case '3':
        return '구름 많음';
      case '4':
        return '흐림';
      default:
        return '알 수 없음';
    }
  }

  private processWeatherDataV2(items): any {
    const currentTemperature = null;
    let maxTemperature = null;
    let minTemperature = null;
    const skyStatusList = [];

    // TMP 온도 데이터 필터링을 위해 사용할 배열
    const temperatures = [];

    // PTY 값을 저장할 변수
    const ptyValueList = [];

    items.forEach((item) => {
      const { category, fcstValue } = item;

      if (category === 'TMP') {
        const temperature = parseFloat(fcstValue);

        // TMP 값들을 배열에 추가하여 최고/최저 온도 판단에 사용
        temperatures.push(temperature);
      }

      if (category === 'SKY') {
        skyStatusList.push(fcstValue); // SKY 상태 값 저장
      }

      if (category === 'PTY') {
        ptyValueList.push(fcstValue); // PTY 상태 값 저장
      }
    });

    // 최고 온도와 최저 온도 설정
    if (temperatures.length > 0) {
      maxTemperature = Math.max(...temperatures);
      minTemperature = Math.min(...temperatures);
    }

    let skyStatus = null;
    let ptyValue = null;
    if (skyStatusList.length > 0 || ptyValueList.length > 0) {
      const skyStatusFrequency = skyStatusList.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      skyStatus = Object.keys(skyStatusFrequency).reduce((a, b) =>
        skyStatusFrequency[a] > skyStatusFrequency[b] ? a : b,
      );

      const ptyValueFrequency = ptyValueList.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      ptyValue = Object.keys(ptyValueFrequency).reduce((a, b) =>
        ptyValueFrequency[a] > ptyValueFrequency[b] ? a : b,
      );
    }

    return {
      currentTemperature,
      maxTemperature,
      minTemperature,
      skyStatus: this.getSkyStatus(skyStatus, ptyValue),
    };
  }

  async getWeeklyWeather(locationName: string) {
    const location = LocationCoordinates[locationName.toUpperCase()];
    const midRegion = MidTermForecastRegion[locationName.toUpperCase()];
    if (!location || !midRegion) {
      throw new NotFoundException(`Location ${locationName} not found`);
    }

    const weeklyWeather = [];

    try {
      // 오늘 날씨 데이터
      const todayWeather = await this.getTodayWeather(locationName);

      weeklyWeather.push({
        location_name: locationName.toUpperCase(),
        date: this.getCurrentDate(),
        current_temperature: todayWeather.currentTemperature,
        max_temperature: todayWeather.maxTemperature,
        min_temperature: todayWeather.minTemperature,
        sky_status: todayWeather.skyStatus,
      });

      // 단기예보 데이터 (오늘+1 ~ 오늘+2)
      const shortTermWeather = await this.getShortTermWeather(
        location,
        locationName,
      );
      weeklyWeather.push(...shortTermWeather);

      // 중기예보 데이터 (오늘+3 ~ 오늘+6)
      const midTermWeather = await this.getMidTermWeather(
        midRegion,
        locationName,
      );
      weeklyWeather.push(...midTermWeather);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new InternalServerErrorException('Weather API request timed out');
      } else if (error.response && error.response.status >= 400) {
        throw new InternalServerErrorException(
          `Weather API returned an error: ${error.response.statusText}`,
        );
      } else {
        throw new InternalServerErrorException(
          `An unexpected error occurred while fetching weather data: ${error.message}`,
        );
      }
    }

    return weeklyWeather;
  }

  private async getShortTermWeather(location, locationName) {
    const baseDate = this.getCurrentDate();
    const baseTime = this.getNearestPastBaseTime();
    const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`;

    const params = {
      serviceKey: this.weatherApiKey,
      numOfRows: 500,
      pageNo: 1,
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: location.nx,
      ny: location.ny,
    };

    try {
      const response = await axios.get(url, { params, timeout: 5000 });
      const items = response?.data?.response?.body?.items?.item;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid data received from short-term weather API');
      }

      const shortTermWeather = [];
      const today = this.getCurrentDate();

      for (let i = 1; i <= 2; i++) {
        const targetDate = dayjs(today).add(i, 'day').format('YYYYMMDD');
        const targetItems = items.filter(
          (item) =>
            item.fcstDate === targetDate &&
            (item.category === 'TMP' ||
              item.category === 'SKY' ||
              item.category === 'PTY'),
        );

        const dayData = this.processWeatherDataV2(targetItems);
        shortTermWeather.push({
          location_name: locationName,
          date: targetDate,
          max_temperature: dayData.maxTemperature,
          min_temperature: dayData.minTemperature,
          sky_status: dayData.skyStatus,
        });
      }

      return shortTermWeather;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch short-term weather data: ${error.message}`,
      );
    }
  }

  private async getMidTermWeather(midRegion, locationName) {
    try {
      // 1. 중기 날씨 상태 데이터 가져오기
      const midLandFcstUrl = `http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst`;
      const midLandParams = {
        serviceKey: this.weatherApiKey,
        numOfRows: 10,
        pageNo: 1,
        dataType: 'JSON',
        regId: midRegion,
        tmFc: this.getMidTermBaseTime(),
      };

      const midLandResponse = await axios.get(midLandFcstUrl, {
        params: midLandParams,
        timeout: 5000,
      });
      const midLandItems =
        midLandResponse?.data?.response?.body?.items?.item?.[0];

      if (!midLandItems) {
        throw new Error('Invalid data received from mid-term weather API');
      }

      // 2. 중기 최고/최저 기온 데이터 가져오기
      const midTaUrl = `http://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa`;
      const midTaParams = {
        serviceKey: this.weatherApiKey,
        numOfRows: 10,
        pageNo: 1,
        dataType: 'JSON',
        regId: midRegion,
        tmFc: this.getMidTermBaseTime(),
      };

      const midTaResponse = await axios.get(midTaUrl, {
        params: midTaParams,
        timeout: 5000,
      });
      const midTaItems = midTaResponse?.data?.response?.body?.items?.item?.[0];

      if (!midTaItems) {
        throw new Error('Invalid data received from mid-term temperature API');
      }

      // 중기예보 데이터 파싱
      const midTermWeather = [];
      for (let i = 3; i <= 6; i++) {
        const targetDate = dayjs().add(i, 'day').format('YYYYMMDD');
        midTermWeather.push({
          location_name: locationName,
          date: targetDate,
          max_temperature: midTaItems[`taMax${i}`],
          min_temperature: midTaItems[`taMin${i}`],
          sky_status: midLandItems[`wf${i}Am`] || '알 수 없음',
        });
      }

      return midTermWeather;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch mid-term weather data: ${error.message}`,
      );
    }
  }

  private getMidTermBaseTime() {
    const now = dayjs();
    const hour = now.hour();

    // 중기예보 발표 시각 기준: 06시, 18시
    if (hour < 6) {
      return now.subtract(1, 'day').format('YYYYMMDD') + '1800';
    } else if (hour < 18) {
      return now.format('YYYYMMDD') + '0600';
    } else {
      return now.format('YYYYMMDD') + '1800';
    }
  }
}
