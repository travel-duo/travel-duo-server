import { SearchFilterService } from '@/common/search-filter.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CreateCountryStateDto } from '@/geography/dto/create-country-state.dto';

@Injectable()
export class GeographyService extends SearchFilterService {
  constructor(
    @InjectRepository(CountryStates)
    private countryStatesRepository: Repository<CountryStates>,
    @InjectRepository(TownCities)
    private townCitiesRepository: Repository<TownCities>,
  ) {
    super();
  }

  createCountryState(
    createCountryStateDto: CreateCountryStateDto,
  ): Promise<CountryStates> {
    const newState = this.countryStatesRepository.create(createCountryStateDto);
    return this.countryStatesRepository.save(newState);
  }
}
