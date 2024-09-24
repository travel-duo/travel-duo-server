import { Module } from '@nestjs/common';
import { TravelMembersController } from '@/travel/controller/travel-members.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TravelMembersController],
  exports: [CommonModule],
})
export class TravelMembersModule {}
