import { Injectable } from '@nestjs/common';
import { WeatherClient } from '@/weather-client/interface/weather-client.interface';
import { WeatherService } from '@/weather-client/services/weather.service';

export enum WeatherServiceType {
  WEATHER = 'Weather',
}

@Injectable()
export class WeatherClientFactory {
  constructor(private weatherService: WeatherService) {}

  getClient(clientType: WeatherServiceType): WeatherClient {
    switch (clientType) {
      case WeatherServiceType.WEATHER:
        return this.weatherService;
      default:
        throw new Error(`Unsupported weather type: ${clientType}`);
    }
  }
}