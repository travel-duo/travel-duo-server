import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelDetailsController } from '@/travel/controller/travel-details.controller';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelsService } from '@/travel/service/travels.service';
import { Users } from '@/user/entities/users.entity';
import { UserService } from '@/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Travels, TravelDetails])],
  controllers: [TravelDetailsController],
  providers: [UserService, TravelsService, TravelDetailsService],
  exports: [TravelDetailsService],
})
export class TravelDetailsModule {}
