import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CountryStatesService } from '@/geography/service/country-states.service';
import { CountryStatesController } from '@/geography/controller/country-states.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CountryStates, TownCities])],
  controllers: [CountryStatesController],
  providers: [CountryStatesService],
  exports: [CountryStatesService],
})
export class CountryStatesModule {}
