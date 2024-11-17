import { Module } from '@nestjs/common';
import { WeatherAPIController } from './weather-api-client.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [WeatherAPIController],
  exports: [CommonModule],
})
export class WeatherApiClientModules {}
