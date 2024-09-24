import { Module } from '@nestjs/common';
import { TravelDetailsController } from '@/travel/controller/travel-details.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TravelDetailsController],
  exports: [CommonModule],
})
export class TravelDetailsModule {}
