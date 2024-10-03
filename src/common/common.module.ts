// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@/user/entities/users.entity';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { UserService } from '@/user/user.service';
import { TravelsService } from '@/travel/service/travels.service';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { TravelLocationsService } from '@/travel/service/travel-locations.service';
import { TownCitiesService } from '@/geography/service/town-cities.service';
import { TravelMembersService } from '@/travel/service/travel-members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Travels,
      TravelDetails,
      TravelLocations,
      TownCities,
      CountryStates,
      TravelMembers,
    ]),
  ],
  providers: [
    UserService,
    TravelsService,
    TravelDetailsService,
    TravelLocationsService,
    TownCitiesService,
    TravelMembersService,
  ],
  exports: [
    TypeOrmModule,
    UserService,
    TravelsService,
    TravelDetailsService,
    TravelLocationsService,
    TownCitiesService,
    TravelMembersService,
  ],
})
export class CommonModule {}
