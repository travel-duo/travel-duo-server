import { Module } from '@nestjs/common';
import { TravelLocationsController } from '@/travel/controller/travel-locations.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TravelLocationsController],
  exports: [CommonModule],
})
export class TravelLocationsModule {}
