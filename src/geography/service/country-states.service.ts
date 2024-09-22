import { SearchFilterService } from '@/common/search-filter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { Repository } from 'typeorm';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { Transactional } from 'typeorm-transactional';
import { CreateCountryStateDto } from '@/geography/dto/create-country-state.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateCountryStateDto } from '@/geography/dto/update-country-state-dto';

@Injectable()
export class CountryStatesService extends SearchFilterService {
  constructor(
    @InjectRepository(CountryStates)
    private countryStatesRepository: Repository<CountryStates>,
    @InjectRepository(TownCities)
    private townCitiesRepository: Repository<TownCities>,
  ) {
    super();
  }

  private readonly logger = new Logger(CountryStatesService.name);

  /**
   * 행정 구역을 생성
   * @param createCountryStateDto
   */
  @Transactional()
  async createCountryState(
    createCountryStateDto: CreateCountryStateDto,
  ): Promise<CountryStates> {
    const newState = this.countryStatesRepository.create(createCountryStateDto);
    return await this.countryStatesRepository.save(newState);
  }

  /**
   * 행정 구역 전체 조회
   */
  async findAllCountryStates(): Promise<CountryStates[]> {
    const countryStates = await this.countryStatesRepository
      .createQueryBuilder('countryStates')
      .leftJoin('countryStates.townCities', 'townCities')
      .select(['countryStates', 'townCities._id', 'townCities.name'])
      .getMany();

    if (!countryStates.length) {
      throw new NotFoundException('No country states found');
    }

    return countryStates;
  }

  /**
   * 특정 행정 구역 조회
   * @param id
   */
  async findOneCountryState(id: bigint): Promise<CountryStates> {
    const countryState = await this.countryStatesRepository
      .createQueryBuilder('countryStates')
      .leftJoin('countryStates.townCities', 'townCities')
      .where('countryStates._id = :id', { id })
      .select(['countryStates', 'townCities._id', 'townCities.name'])
      .getOne();

    if (!countryState) {
      throw new NotFoundException(`CountryState with ID "${id}" not found`);
    }
    return countryState;
  }

  /**
   * 행정 구역을 업데이트
   *
   * @param id
   * @param updateCountryStateDto
   */
  @Transactional()
  async updateCountryState(
    updateCountryStateDto: UpdateCountryStateDto,
  ): Promise<CountryStates> {
    const countryState = await this.findOneCountryState(
      updateCountryStateDto.id,
    );

    if (!countryState) {
      throw new NotFoundException(
        `CountryState with id ${updateCountryStateDto.id} not found`,
      );
    }

    return await this.countryStatesRepository.save({
      ...countryState,
      ...updateCountryStateDto,
    });
  }

  /**
   * 행정 구역을 삭제
   * @param id
   */
  @Transactional()
  async removeCountryState(id: bigint): Promise<boolean> {
    const countryState = await this.findOneCountryState(id);
    if (!countryState) {
      throw new NotFoundException(`CountryState with ID "${id}" not found`);
    }

    try {
      await this.townCitiesRepository.delete({ countryState: { _id: id } });
      await this.countryStatesRepository.remove(countryState);
      return true;
    } catch (error) {
      this.logger.error(error.message);
      return false;
    }
  }
}
