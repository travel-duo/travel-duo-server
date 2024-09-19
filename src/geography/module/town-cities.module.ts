import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { TownCitiesService } from '@/geography/service/town-cities.service';
import { TownCitiesController } from '@/geography/controller/town-cities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CountryStates, TownCities])],
  controllers: [TownCitiesController],
  providers: [TownCitiesService],
  exports: [TownCitiesService],
})
export class TownCitiesModule {}
