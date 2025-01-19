import { Injectable } from '@nestjs/common';
import { WeatherClient } from '@/weather-client/interfaces/weather-client.interface';
import { KmaWeatherService } from '@/weather-client/services/kma-weather.service';
import { WaWeatherService } from '@/weather-client/services/wa-weather.service';

export enum WeatherServiceType {
  KMA = 'korea-meteorological-administration',
  WA = 'weather-api',
}

@Injectable()
export class WeatherClientFactory {
  constructor(
    private kmaWeatherService: KmaWeatherService,
    private waWeatherService: WaWeatherService,
  ) {}

  getClient(clientType: WeatherServiceType): WeatherClient {
    switch (clientType) {
      case WeatherServiceType.KMA:
        return this.kmaWeatherService;
      case WeatherServiceType.WA:
        return this.waWeatherService;

      default:
        throw new Error(`Unsupported weather type: ${clientType}`);
    }
  }
}
