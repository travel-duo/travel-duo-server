import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherController } from './weather-client.controller';
import { WeatherClientFactory } from './weather-client.factory';
import { WeatherService } from './services/weather.service';

@Module({
  imports: [ConfigModule],
  controllers: [WeatherController],
  providers: [WeatherClientFactory, WeatherService],
  exports: [WeatherClientFactory],
})
export class WeatherClientModule {}