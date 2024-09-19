import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchFilterService } from '@/common/search-filter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { Repository } from 'typeorm';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CreateTownCityDto } from '@/geography/dto/create-town-city.dto';
import { Transactional } from 'typeorm-transactional';
import { UpdateTownCityDto } from '@/geography/dto/update-town-city.dto';

@Injectable()
export class TownCitiesService extends SearchFilterService {
  constructor(
    @InjectRepository(CountryStates)
    private countryStatesRepository: Repository<CountryStates>,
    @InjectRepository(TownCities)
    private townCitiesRepository: Repository<TownCities>,
  ) {
    super();
  }

  /**
   * 시,군,구를 생성
   * @param createTownCityDto
   */
  @Transactional()
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
   * 시,군,구 전체 조회
   */
  async findAllTownCities(): Promise<TownCities[]> {
    const townCities = await this.townCitiesRepository.find();
    if (!townCities.length) {
      throw new NotFoundException('No town cities found');
    }
    return townCities;
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
      .innerJoin('townCities.countryState', 'countryState')
      .leftJoin('townCities.locations', 'travelLocations') // Join travelLocations
      .leftJoin('travelLocations.travelDetails', 'travelDetails') // Join travelDetails
      .leftJoin('travelDetails.travel', 'travel') // Join travel
      .leftJoin('travel.creator', 'users') // Join users
      .where('users._id = :userId', { userId }) // Filter by user _id
      .select(['townCities', 'countryState._id', 'countryState.name'])
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

  /**
   * 특정 시,군,구를 업데이트
   *
   * @param updateTownCityDto
   */
  @Transactional()
  async updateTownCity(
    updateTownCityDto: UpdateTownCityDto,
  ): Promise<TownCities> {
    const townCity = await this.findOneTownCity(updateTownCityDto.id);
    if (!townCity) {
      throw new NotFoundException(
        `TownCity with ID "${updateTownCityDto.id}" not found`,
      );
    }

    const { countryStateId, ...townCityData } = updateTownCityDto;
    const countryState = await this.countryStatesRepository.findOne({
      where: { _id: countryStateId },
    });

    if (!countryState) {
      throw new NotFoundException(
        `CountryState with id ${countryStateId} not found`,
      );
    }

    return await this.townCitiesRepository.save({
      ...townCity,
      ...townCityData,
      countryState,
    });
  }

  /**
   * 특정 시,군,구를 삭제
   * @param id
   */
  @Transactional()
  async removeTownCity(id: bigint): Promise<boolean> {
    const townCity = await this.findOneTownCity(id);
    if (!townCity) {
      throw new NotFoundException(`TownCity with ID "${id}" not found`);
    }

    try {
      await this.townCitiesRepository.remove(townCity);
      return true;
    } catch (error) {
      return false;
    }
  }
}
