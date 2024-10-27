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
   *
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
   * 시,군,구를 bulk로 생성
   *
   * @param createTownCityDtos
   */
  @Transactional()
  async createTownCitiesBulk(
    createTownCityDtos: CreateTownCityDto[],
  ): Promise<TownCities[]> {
    const newCities: TownCities[] = [];

    for (const createTownCityDto of createTownCityDtos) {
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

      newCities.push(newCity);
    }

    return await this.townCitiesRepository.save(newCities);
  }

  /**
   * 시,군,구 전체 조회
   */
  async findAllTownCities(): Promise<TownCities[]> {
    const townCities = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .innerJoin('townCities.countryState', 'countryState')
      .select(['townCities', 'countryState._id', 'countryState.name'])
      .getMany();

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
    const townCity = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .where('townCities._id = :id', { id })
      .innerJoin('townCities.countryState', 'countryState')
      .select(['townCities', 'countryState._id', 'countryState.name'])
      .getOne();

    if (!townCity) {
      throw new NotFoundException(`TownCity with ID "${id}" not found`);
    }

    return townCity;
  }

  /**
   * 특정 시,군,구 이름으로 조회
   * @param name
   */
  async findTownCitiesByName(name: string): Promise<TownCities[]> {
    const townCities = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .where('townCities.name = :name', { name })
      .innerJoin('townCities.countryState', 'countryState')
      .select(['townCities', 'countryState._id', 'countryState.name'])
      .getMany();

    if (!townCities) {
      throw new NotFoundException(`TownCity with name "${name}" not found`);
    }

    return townCities;
  }

  /**
   * 내가 방문한 특정 시,군,구 들을 조회
   * @param userId
   */
  async findMyVisitedTownCities(userId: bigint): Promise<TownCities[]> {
    const townCities = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .innerJoin('townCities.countryState', 'countryState')
      .innerJoin('townCities.travels', 'travels') // ManyToMany 관계를 통한 join
      .innerJoin('travels.creator', 'users') // Travel의 creator와 join
      .where('users._id = :userId', { userId })
      .select([
        'townCities._id',
        'townCities.name',
        'countryState._id',
        'countryState.name',
      ])
      .distinct(true)
      .getMany();

    if (!townCities.length) {
      throw new NotFoundException(
        `No visited town cities found for user with ID "${userId}"`,
      );
    }

    return townCities;
  }

  /**
   * 여러 시,군,구를 ID 목록으로 조회
   *
   * @param ids 시,군,구 ID 배열
   * @returns 해당 ID들에 해당하는 TownCities 배열
   * @throws NotFoundException 모든 ID에 해당하는 시,군,구가 존재하지 않을 경우
   */
  async findByIds(ids: bigint[]): Promise<TownCities[]> {
    if (!ids || ids.length === 0) {
      throw new NotFoundException('No IDs provided');
    }

    const townCities = await this.townCitiesRepository
      .createQueryBuilder('townCities')
      .innerJoin('townCities.countryState', 'countryState')
      .select(['townCities', 'countryState._id', 'countryState.name'])
      .where('townCities._id IN (:...ids)', { ids })
      .getMany();

    if (townCities.length === 0) {
      throw new NotFoundException('No town cities found for the provided IDs');
    }

    // 요청된 모든 ID에 대해 도시가 존재하는지 확인
    const foundIds = townCities.map((tc) => tc._id.toString());
    const missingIds = ids
      .map((id) => id.toString())
      .filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `TownCities with IDs ${missingIds.join(', ')} not found`,
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
      .leftJoin('townCities.locations', 'travelLocations')
      .leftJoin('travelLocations.travelDetails', 'travelDetails')
      .leftJoin('travelDetails.travel', 'travel')
      .leftJoin('travel.creator', 'users')
      .where('users._id = :userId', { userId })
      .distinct(true)
      .getCount();

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
