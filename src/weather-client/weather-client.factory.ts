import { Injectable } from '@nestjs/common';
import { WeatherClient } from '@/weather-client/interfaces/weather-client.interface';
import { KmaWeatherService } from '@/weather-client/services/kma-weather.service';

export enum WeatherServiceType {
  KMA = 'korea-meteorological-administration',
}

@Injectable()
export class WeatherClientFactory {
  constructor(private kmaWeatherService: KmaWeatherService) {}

  getClient(clientType: WeatherServiceType): WeatherClient {
    switch (clientType) {
      case WeatherServiceType.KMA:
        return this.kmaWeatherService;
      default:
        throw new Error(`Unsupported weather type: ${clientType}`);
    }
  }
}
