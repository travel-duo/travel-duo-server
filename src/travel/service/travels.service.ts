import { SearchFilterService } from '@/common/search-filter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { Repository } from 'typeorm';
import { CreateTravelDto } from '@/travel/dto/create-travel.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { fromZonedTime } from 'date-fns-tz';
import { Transactional } from 'typeorm-transactional';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { UpdateTravelDto } from '@/travel/dto/update-travel.dto';

@Injectable()
export class TravelsService extends SearchFilterService {
  constructor(
    @InjectRepository(Travels)
    private travelsRepository: Repository<Travels>,
    @InjectRepository(TravelDetails)
    private travelDetailsRepository: Repository<TravelDetails>,
    @InjectRepository(TravelLocations)
    private travelLocationsRepository: Repository<TravelLocations>,
    private userService: UserService,
  ) {
    super();
  }

  private readonly logger = new Logger(TravelsService.name);

  /**
   * 여행 생성
   *
   * @param createTravelDto
   */
  @Transactional()
  async create(createTravelDto: CreateTravelDto): Promise<Travels> {
    const { creatorId, startDate, endDate, ...travelData } = createTravelDto;
    const creator = await this.userService.findOne(creatorId);

    if (!creator) {
      throw new Error(`User with id ${creatorId} not found`);
    }

    const zoneStartDate = fromZonedTime(startDate, 'Asia/Seoul');
    const zoneEndDate = fromZonedTime(endDate, 'Asia/Seoul');
    const travel = this.travelsRepository.create({
      ...travelData,
      startDate: zoneStartDate,
      endDate: zoneEndDate,
      creator,
    });

    return await this.travelsRepository.save(travel);
  }

  /**
   * 모든 여행 조회
   */
  async findTravelAll(): Promise<Travels[]> {
    const travels = await this.travelsRepository.find();

    if (!travels.length) {
      throw new NotFoundException('No travels found');
    }

    return travels;
  }

  /**
   * 모든 여행 상세 조회
   */
  async findDeepTravelAll(): Promise<Travels[]> {
    const travels = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoin('travels.creator', 'users')
      .leftJoin('travels.travelDetails', 'travelDetails')
      .leftJoin('travelDetails.locations', 'travelLocations')
      .innerJoin('travelLocations.townCities', 'townCities')
      .innerJoin('townCities.countryState', 'countryState')
      .select([
        'users',
        'travels',
        'travelDetails',
        'travelLocations',
        'townCities',
        'countryState',
      ])
      .getMany();

    if (!travels.length) {
      throw new Error('No travels found');
    }

    return travels;
  }

  /**
   * 특정 여행 조회
   *
   * @param id
   */
  async findTravel(id: bigint): Promise<Travels> {
    const travel = await this.travelsRepository.findOneBy({ _id: id });

    if (!travel) {
      throw new Error(`Travel with ID "${id}" not found`);
    }

    return travel;
  }

  /**
   * 특정 여행 상세 조회
   *
   * @param id
   */
  async findDeepTravel(id: bigint): Promise<Travels> {
    const travel = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoin('travels.creator', 'users')
      .leftJoin('travels.travelDetails', 'travelDetails')
      .leftJoin('travelDetails.locations', 'travelLocations')
      .innerJoin('travelLocations.townCities', 'townCities')
      .innerJoin('townCities.countryState', 'countryState')
      .select([
        'users',
        'travels',
        'travelDetails',
        'travelLocations',
        'townCities',
        'countryState',
      ])
      .where('travels._id = :id', { id })
      .getOne();

    if (!travel) {
      throw new Error(`Travel with ID "${id}" not found`);
    }

    return travel;
  }

  /**
   * userId로 여행 조회
   *
   * @param userId
   */
  async findTravelsByUserId(userId: bigint): Promise<Travels[]> {
    const travels = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoin('travels.creator', 'users')
      .where('users._id = :userId', { userId })
      .getMany();

    if (!travels.length) {
      throw new Error(`No travels found for user with ID "${userId}"`);
    }

    return travels;
  }

  /**
   * userId로 여행 상세 조회
   *
   * @param userId
   */
  async findDeepTravelsByUserId(userId: bigint): Promise<Travels[]> {
    const travels = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoin('travels.creator', 'users')
      .leftJoin('travels.travelDetails', 'travelDetails')
      .leftJoin('travelDetails.locations', 'travelLocations')
      .innerJoin('travelLocations.townCities', 'townCities')
      .innerJoin('townCities.countryState', 'countryState')
      .select([
        'users',
        'travels',
        'travelDetails',
        'travelLocations',
        'townCities',
        'countryState',
      ])
      .where('users._id = :userId', { userId })
      .getMany();

    if (!travels.length) {
      throw new Error(`No travels found for user with ID "${userId}"`);
    }

    return travels;
  }

  /**
   * 여행 업데이트
   *
   * @param updateTravelDto
   */
  @Transactional()
  async updateTravel(updateTravelDto: UpdateTravelDto): Promise<Travels> {
    const travel = await this.findDeepTravel(updateTravelDto.id);

    if (!travel) {
      throw new NotFoundException(
        `Travel with id ${updateTravelDto.id} not found`,
      );
    }

    return await this.travelsRepository.save({
      ...travel,
      ...updateTravelDto,
    });
  }

  /**
   * 여행 삭제
   *
   * @param id
   */
  @Transactional()
  async deleteTravel(id: bigint): Promise<boolean> {
    try {
      // 여행 조회
      const travel = await this.findDeepTravel(id);

      if (!travel) {
        throw new NotFoundException(`Travel with id ${id} not found`);
      }

      // 여행 상세 조회
      const travelDetails = await this.travelDetailsRepository.find({
        where: { travel: travel },
      });

      // 여행 상세가 존재할 경우
      if (travelDetails.length > 0) {
        for (const travelDetail of travelDetails) {
          // 여행 장소 조회
          const travelLocations = await this.travelLocationsRepository.find({
            where: { travelDetails: travelDetail },
          });

          // 여행 장소가 존재할 경우
          if (travelLocations.length > 0) {
            for (const travelLocation of travelLocations) {
              // 여행 장소 삭제
              await this.travelLocationsRepository.remove(travelLocation);
            }
          }
          // 여행 상세 삭제
          await this.travelDetailsRepository.remove(travelDetail);
        }
      }
      // 여행 삭제
      await this.travelsRepository.remove(travel);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete travel with ID "${id}": ${error.message}`,
      );
      return false;
    }
  }
}
