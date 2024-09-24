import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelsController } from '@/travel/controller/travels.controller';
import { TravelsService } from '@/travel/service/travels.service';
import { UserService } from '@/user/user.service';
import { Users } from '@/user/entities/users.entity';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { TravelLocationsService } from '@/travel/service/travel-locations.service';
import { TownCitiesService } from '@/geography/service/town-cities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Travels,
      TravelDetails,
      TravelLocations,
      TownCities,
      CountryStates,
    ]),
  ],
  controllers: [TravelsController],
  providers: [
    UserService,
    TravelsService,
    TravelDetailsService,
    TravelLocationsService,
    TownCitiesService,
  ],
  exports: [TravelsService],
})
export class TravelsModule {}
