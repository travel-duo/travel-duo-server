import { SearchFilterService } from '@/common/search-filter.service';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTravelDetailsDto } from '@/travel/dto/create-travel-details.dto';
import { toZonedTime } from 'date-fns-tz';
import { TravelsService } from '@/travel/service/travels.service';
import { Transactional } from 'typeorm-transactional';
import { UpdateTravelDetailsDto } from '@/travel/dto/update-travel-details.dto';

@Injectable()
export class TravelDetailsService extends SearchFilterService {
  constructor(
    @InjectRepository(TravelDetails)
    private travelDetailRepository: Repository<TravelDetails>,
    private travelsService: TravelsService,
  ) {
    super();
  }

  private readonly logger = new Logger(TravelDetailsService.name);

  /**
   * 상세 여행 생성
   *
   * @param createTravelDetailDto
   */
  @Transactional()
  async createTravelDetail(
    createTravelDetailDto: CreateTravelDetailsDto,
  ): Promise<TravelDetails> {
    const { travelId, startDate, endDate, ...travelDetailData } =
      createTravelDetailDto;

    const travel = await this.travelsService.findTravelDeep(travelId);

    const zoneStartDate = toZonedTime(startDate, 'Asia/Seoul');
    const zoneEndDate = toZonedTime(endDate, 'Asia/Seoul');

    const travelDetail = this.travelDetailRepository.create({
      ...travelDetailData,
      startDate: zoneStartDate,
      endDate: zoneEndDate,
      travel,
    });
    return await this.travelDetailRepository.save(travelDetail);
  }

  /**
   * 모든 상세 여행 조회
   */
  async findAllTravelDetails(): Promise<TravelDetails[]> {
    const travelDetails = await this.travelDetailRepository.find();
    if (!travelDetails) {
      throw new Error('TravelDetails not found');
    }

    return travelDetails;
  }

  /**
   * 모든 상세 여행 상세 조회
   */
  async findAllTravelDetailsDeep(): Promise<TravelDetails[]> {
    const travelDetails = await this.travelDetailRepository
      .createQueryBuilder('travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .getMany();

    if (!travelDetails) {
      throw new Error('TravelDetails not found');
    }

    return travelDetails;
  }

  /**
   * 특정 상세 여행 조회
   *
   * @param travelDetailId
   */
  async findOneTravelDetail(travelDetailId: bigint): Promise<TravelDetails> {
    const travelDetail = await this.travelDetailRepository.findOne({
      where: { _id: travelDetailId },
    });
    if (!travelDetail) {
      throw new Error(`TravelDetails with ID "${travelDetailId}" not found`);
    }

    return travelDetail;
  }

  /**
   * 특정 상세 여행 상세 조회
   *
   * @param travelDetailId
   */
  async findOneTravelDetailDeep(
    travelDetailId: bigint,
  ): Promise<TravelDetails> {
    const travelDetail = await this.travelDetailRepository
      .createQueryBuilder('travelDetails')
      .innerJoinAndSelect('travelDetails.travel', 'travels')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .where('travelDetails._id = :id', { id: travelDetailId })
      .getOne();

    if (!travelDetail) {
      throw new Error(`TravelDetails with ID "${travelDetailId}" not found`);
    }

    return travelDetail;
  }

  /**
   * travelId로 특정 상세 여행들 조회
   *
   * @param travelId
   */
  async findTravelDetailsByTId(travelId: bigint): Promise<TravelDetails[]> {
    const travelDetails = await this.travelDetailRepository
      .createQueryBuilder('travelDetails')
      .innerJoinAndSelect('travelDetails.travel', 'travels')
      .where('travels._id = :travelId', { travelId })
      .getMany();

    if (!travelDetails.length) {
      throw new Error(`TravelDetails with travelId ${travelId} not found`);
    }

    return travelDetails;
  }

  /**
   * travelId로 특정 상세 여행들 상세 조회
   *
   * @param travelId
   */
  async findTravelDetailsDeepByTId(travelId: bigint): Promise<TravelDetails[]> {
    const travelDetails = await this.travelDetailRepository
      .createQueryBuilder('travelDetails')
      .innerJoinAndSelect('travelDetails.travel', 'travels')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .where('travels._id = :travelId', { travelId })
      .getMany();

    if (!travelDetails.length) {
      throw new Error(`TravelDetails with travelId ${travelId} not found`);
    }

    return travelDetails;
  }

  /**
   * 특정 상세 여행 수정
   *
   * @param updateTravelDetailDto
   */
  @Transactional()
  async updateTravelDetail(
    updateTravelDetailDto: UpdateTravelDetailsDto,
  ): Promise<TravelDetails> {
    const { id, startDate, endDate, ...travelDetailData } =
      updateTravelDetailDto;

    const travelDetail = await this.findOneTravelDetailDeep(id);

    const zoneStartDate = toZonedTime(startDate, 'Asia/Seoul');
    const zoneEndDate = toZonedTime(endDate, 'Asia/Seoul');

    Object.assign(travelDetail, {
      ...travelDetailData,
      startDate: zoneStartDate,
      endDate: zoneEndDate,
    });
    try {
      return await this.travelDetailRepository.save(travelDetail);
    } catch (error) {
      throw new Error(
        `Failed to update TravelDetails with id ${id}: ${error.message}`,
      );
    }
  }
}
