import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelDetailsController } from '@/travel/controller/travel-details.controller';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelsService } from '@/travel/service/travels.service';
import { Users } from '@/user/entities/users.entity';
import { UserService } from '@/user/user.service';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { TravelLocationsService } from '@/travel/service/travel-locations.service';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CountryStates } from '@/geography/entities/country-states.entity';
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
  controllers: [TravelDetailsController],
  providers: [
    UserService,
    TravelsService,
    TravelDetailsService,
    TravelLocationsService,
    TownCitiesService,
  ],
  exports: [TravelDetailsService],
})
export class TravelDetailsModule {}
