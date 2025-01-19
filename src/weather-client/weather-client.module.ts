import { Module } from '@nestjs/common';
import { WeatherController } from './weather-client.controller';
import { WeatherClientFactory } from './weather-client.factory';
import { KmaWeatherService } from './services/kma-weather.service';
import { WeatherGridConverter } from '@/weather-client/converters/weather-grid.converter';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { LocalClientModule } from '@/local-client/local-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TownCities]),
    ConfigModule,
    LocalClientModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherClientFactory, KmaWeatherService, WeatherGridConverter],
  exports: [WeatherClientFactory],
})
export class WeatherClientModule {}
