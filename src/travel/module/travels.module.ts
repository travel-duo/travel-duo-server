import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelsController } from '@/travel/controller/travels.controller';
import { TravelsService } from '@/travel/service/travels.service';
import { UserService } from '@/user/user.service';
import { Users } from '@/user/entities/users.entity';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Travels, TravelDetails, TravelLocations]),
  ],
  controllers: [TravelsController],
  providers: [TravelsService, UserService],
  exports: [TravelsService],
})
export class TravelsModule {}
