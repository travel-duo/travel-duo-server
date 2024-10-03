import { Module } from '@nestjs/common';
import { TravelsController } from '@/travel/controller/travels.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TravelsController],
  exports: [CommonModule],
})
export class TravelsModule {}
