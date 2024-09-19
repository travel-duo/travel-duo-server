import { SearchFilterService } from '@/common/search-filter.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CreateCountryStateDto } from '@/geography/dto/create-country-state.dto';
import { CreateTownCityDto } from '@/geography/dto/create-town-city.dto';

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

  /**
   * 행정 구역을 생성
   * @param createCountryStateDto
   */
  async createCountryState(
    createCountryStateDto: CreateCountryStateDto,
  ): Promise<CountryStates> {
    const newState = this.countryStatesRepository.create(createCountryStateDto);
    return await this.countryStatesRepository.save(newState);
  }

  /**
   * 특정 행정 구역 조회
   * @param id
   */
  async findOneCountryState(id: bigint): Promise<CountryStates> {
    const countryState = await this.countryStatesRepository.findOne({
      where: { _id: id },
    });
    if (!countryState) {
      throw new NotFoundException(`CountryState with ID "${id}" not found`);
    }
    return countryState;
  }

  /**
   * 시,군,구를 생성
   * @param createTownCityDto
   */
  async createTownCity(
    createTownCityDto: CreateTownCityDto,
  ): Promise<TownCities> {
    const { countryStateId, ...townCityData } = createTownCityDto;
    const countryState = await this.countryStatesRepository.findOne({
      where: { _id: countryStateId },
    });

    if (!countryState) {
      throw new NotFoundException(
        `CountryState with id ${countryStateId} not found`,
      );
    }

    const newCity = this.townCitiesRepository.create({
      ...townCityData,
      countryState,
    });

    return await this.townCitiesRepository.save(newCity);
  }

  /**
   * 특정 시,군,구 조회
   * @param id
   */
  async findOneTownCity(id: bigint): Promise<TownCities> {
    const townCity = await this.townCitiesRepository.findOne({
      where: { _id: id },
    });
    if (!townCity) {
      throw new NotFoundException(`TownCity with ID "${id}" not found`);
    }
    return townCity;
  }

  /**
   * 내가 방문한 특정 시,군,구 들을 조회
   * @param userId
   */
  async findMyVisitedTownCities(userId: bigint): Promise<TownCities[]> {
    const townCities = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .leftJoin('townCities.locations', 'travelLocations') // Join travelLocations
      .leftJoin('travelLocations.travelDetails', 'travelDetails') // Join travelDetails
      .leftJoin('travelDetails.travel', 'travel') // Join travel
      .leftJoin('travel.creator', 'users') // Join users
      .where('users._id = :userId', { userId }) // Filter by user _id
      .distinct(true) // distinct results
      .getMany();

    if (!townCities.length) {
      throw new NotFoundException(
        `No visited town cities found for user with ID "${userId}"`,
      );
    }

    return townCities;
  }

  /**
   * 내가 방문한 특정 시,군,구 들의 방문수를 조회
   * @param userId
   */
  async countVisitedTownCities(userId: bigint): Promise<number> {
    const townCitiesCount = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .leftJoin('townCities.locations', 'travelLocations') // Join travelLocations
      .leftJoin('travelLocations.travelDetails', 'travelDetails') // Join travelDetails
      .leftJoin('travelDetails.travel', 'travel') // Join travels
      .leftJoin('travel.creator', 'users') // Join users
      .where('users._id = :userId', { userId }) // Filter by user _id
      .distinct(true) // Ensure distinct results
      .getCount(); // Get the count of distinct townCities

    if (townCitiesCount === 0) {
      throw new NotFoundException(
        `No visited town cities found for user with ID "${userId}"`,
      );
    }

    return townCitiesCount;
  }
}
