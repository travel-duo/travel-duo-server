import { SearchFilterService } from '@/common/search-filter.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { Repository } from 'typeorm';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { fromZonedTime } from 'date-fns-tz';
import { CreateTravelLocationsDto } from '@/travel/dto/create-travel-locations.dto';
import { TownCitiesService } from '@/geography/service/town-cities.service';
import { Transactional } from 'typeorm-transactional';
import { UpdateTravelLocationDto } from '@/travel/dto/update-travel-location.dto';

@Injectable()
export class TravelLocationsService extends SearchFilterService {
  constructor(
    @InjectRepository(TravelLocations)
    private travelLocationsRepository: Repository<TravelLocations>,
    @Inject(forwardRef(() => TravelDetailsService))
    private travelDetailsService: TravelDetailsService,
    private townCitiesService: TownCitiesService,
  ) {
    super();
  }

  private readonly logger = new Logger(TravelLocationsService.name);

  /**
   * 여행지 장소 생성
   * @param createTravelLocationsDto
   */
  @Transactional()
  async createTravelLocation(
    createTravelLocationsDto: CreateTravelLocationsDto,
  ): Promise<TravelLocations> {
    const { travelDetailId, townCityId, startDate, endDate, ...locationData } =
      createTravelLocationsDto;
    const travelDetails =
      await this.travelDetailsService.findOneTravelDetail(travelDetailId);
    const townCities = await this.townCitiesService.findOneTownCity(townCityId);

    if (!travelDetails) {
      throw new Error(`TravelDetails with id ${travelDetailId} not found`);
    }

    if (!townCities) {
      throw new Error(`TownCity with id ${townCityId} not found`);
    }

    const zoneStartDate = fromZonedTime(startDate, 'Asia/Seoul');
    const zoneEndDate = fromZonedTime(endDate, 'Asia/Seoul');

    const location = this.travelLocationsRepository.create({
      ...locationData,
      startDate: zoneStartDate,
      endDate: zoneEndDate,
      travelDetails,
      townCities,
    });

    return await this.travelLocationsRepository.save(location);
  }

  /**
   * 여행지 장소 전체 조회
   */
  async findAllTravelLocations(): Promise<TravelLocations[]> {
    const locations = await this.travelLocationsRepository
      .createQueryBuilder('travelLocations')
      .innerJoinAndSelect('travelLocations.townCities', 'townCities')
      .innerJoinAndSelect('townCities.countryState', 'countryState')
      .getMany();

    if (!locations.length) {
      throw new Error('No travel locations found');
    }

    return locations;
  }

  /**
   * 특정 여행지 장소 조회
   *
   * @param id
   */
  async findOneTravelLocation(id: bigint): Promise<TravelLocations> {
    const location = await this.travelLocationsRepository
      .createQueryBuilder('travelLocations')
      .innerJoinAndSelect('travelLocations.townCities', 'townCities')
      .innerJoinAndSelect('townCities.countryState', 'countryState')
      .where('travelLocations._id = :id', { id })
      .getOne();

    if (!location) {
      throw new Error(`TravelLocations with id ${id} not found`);
    }

    return location;
  }

  /**
   * travelDetailId로 여행지 장소들 조회
   *
   * @param travelDetailId
   */
  async findTravelLocationsByTDId(
    travelDetailId: bigint,
  ): Promise<TravelLocations[]> {
    const locations = await this.travelLocationsRepository
      .createQueryBuilder('travelLocations')
      .innerJoinAndSelect('travelLocations.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .where('travelDetails._id = :travelDetailId', { travelDetailId })
      .getMany();

    if (!locations.length) {
      throw new Error(
        `TravelLocations with travelDetailId ${travelDetailId} not found`,
      );
    }
    return locations;
  }

  /**
   * 특정 여행지 장소 수정
   *
   * @param updateTravelLocationsDto
   */
  @Transactional()
  async updateTravelLocation(
    updateTravelLocationsDto: UpdateTravelLocationDto,
  ): Promise<TravelLocations> {
    const {
      id,
      travelDetailId,
      townCityId,
      startDate,
      endDate,
      ...locationData
    } = updateTravelLocationsDto;

    const location = await this.findOneTravelLocation(id);
    if (!location) {
      throw new Error(`TravelLocations with id ${id} not found`);
    }

    const travelDetail =
      await this.travelDetailsService.findOneTravelDetail(travelDetailId);
    if (!travelDetail) {
      throw new Error(`TravelDetails with id ${travelDetailId} not found`);
    }

    const townCity = await this.townCitiesService.findOneTownCity(townCityId);
    if (!townCity) {
      throw new Error(`TownCity with id ${townCityId} not found`);
    }

    const zoneStartDate = fromZonedTime(startDate, 'Asia/Seoul');
    const zoneEndDate = fromZonedTime(endDate, 'Asia/Seoul');

    Object.assign(location, {
      ...locationData,
      startDate: zoneStartDate,
      endDate: zoneEndDate,
      travelDetails: travelDetail,
      townCities: townCity,
    });

    try {
      return await this.travelLocationsRepository.save(location);
    } catch (error) {
      throw new Error(
        `Failed to update TravelLocations with id ${id}: ${error.message}`,
      );
    }
  }

  /**
   * 특정 여행지 장소 삭제
   *
   * @param id
   */
  @Transactional()
  async removeTravelLocation(id: bigint): Promise<boolean> {
    try {
      const location = await this.findOneTravelLocation(id);

      if (!location) {
        throw new Error(`TravelLocations with id ${id} not found`);
      }

      await this.travelLocationsRepository.remove(location);
      return true;
    } catch (e) {
      this.logger.error(
        `Failed to remove TravelLocations with id ${id}: ${e.message}`,
      );
      return false;
    }
  }

  /**
   * travelDetailId로 여행지 장소들 삭제
   *
   * @param travelDetailId
   */
  @Transactional()
  async removeTravelLocationsByTDId(travelDetailId: bigint): Promise<boolean> {
    try {
      const locations = await this.findTravelLocationsByTDId(travelDetailId);
      await this.travelLocationsRepository.remove(locations);
      return true;
    } catch (e) {
      this.logger.error(
        `Failed to remove TravelLocations with travelDetailId ${travelDetailId}: ${e.message}`,
      );
      return false;
    }
  }
}
