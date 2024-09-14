import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeographyController } from '@/geography/geography.controller';
import { GeographyService } from '@/geography/geography.service';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountryStates, TownCities])],
  controllers: [GeographyController],
  providers: [GeographyService],
  exports: [GeographyService],
})
export class GeographyModule {}
