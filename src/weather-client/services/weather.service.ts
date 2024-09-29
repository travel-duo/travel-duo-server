import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherClient, WeatherForecast } from '@/weather-client/interface/weather-client.interface';

@Injectable()
export class WeatherService implements WeatherClient {
  private readonly apiEndpoint: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiEndpoint = this.configService.get<string>('WEATHER_API_ENDPOINT');
    this.apiKey = this.configService.get<string>('WEATHER_SERVICE_KEY');

    if (!this.apiEndpoint || !this.apiKey) {
      throw new Error('Weather API configuration is missing');
    }
  }

  async getShortTermForecast(
    nx: number,
    ny: number,
    baseDate: string,
    baseTime: string,
  ): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get(`${this.apiEndpoint}/getVilageFcst`, {
        params: {
          serviceKey: this.apiKey,
          numOfRows: '1000', // 충분한 데이터를 가져오기 위해 증가
          pageNo: '1',
          dataType: 'JSON',
          base_date: baseDate,
          base_time: baseTime,
          nx: nx,
          ny: ny,
        },
      });

      const items = response.data.response.body.items.item;
      return this.parseWeatherData(items);
    } catch (error) {
      console.error('날씨 정보를 가져오는 데 실패했습니다:', error);
      throw error;
    }
  }

  async getTodayForecast(nx: number, ny: number): Promise<WeatherForecast[]> {
    const today = new Date();
    const baseDate = today.toISOString().slice(0, 10).replace(/-/g, '');
    const baseTime = this.getBaseTime(today);
    return this.getShortTermForecast(nx, ny, baseDate, baseTime);
  }

  private getBaseTime(date: Date): string {
    const hour = date.getHours();
    if (hour < 2) return '2300';
    if (hour < 5) return '0200';
    if (hour < 8) return '0500';
    if (hour < 11) return '0800';
    if (hour < 14) return '1100';
    if (hour < 17) return '1400';
    if (hour < 20) return '1700';
    if (hour < 23) return '2000';
    return '2300';
  }

  private parseWeatherData(items: any[]): WeatherForecast[] {
    const weatherMap = new Map<string, WeatherForecast>();

    items.forEach(item => {
      const key = `${item.fcstDate}-${item.fcstTime}`;
      if (!weatherMap.has(key)) {
        weatherMap.set(key, {
          date: `${item.fcstDate} ${item.fcstTime}`,
          temperature: null,
          humidity: null,
        });
      }

      const forecast = weatherMap.get(key);
      switch (item.category) {
        case 'TMP':
          forecast.temperature = parseFloat(item.fcstValue);
          break;
        case 'REH':
          forecast.humidity = parseFloat(item.fcstValue);
          break;
      }
    });

    return Array.from(weatherMap.values());
  }
}