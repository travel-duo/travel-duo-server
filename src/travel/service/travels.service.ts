import { SearchFilterService } from '@/common/search-filter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { Repository } from 'typeorm';
import { CreateTravelDto } from '@/travel/dto/create-travel.dto';
import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { fromZonedTime } from 'date-fns-tz';
import { Transactional } from 'typeorm-transactional';
import { UpdateTravelDto } from '@/travel/dto/update-travel.dto';
import { TravelDetailsService } from '@/travel/service/travel-details.service';

@Injectable()
export class TravelsService extends SearchFilterService {
  constructor(
    @InjectRepository(Travels)
    private travelsRepository: Repository<Travels>,
    private userService: UserService,
    @Inject(forwardRef(() => TravelDetailsService))
    private travelDetailsService: TravelDetailsService,
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
  async createTravel(createTravelDto: CreateTravelDto): Promise<Travels> {
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
  async findAllTravel(): Promise<Travels[]> {
    const travels = await this.travelsRepository.find();

    if (!travels.length) {
      throw new NotFoundException('No travels found');
    }

    return travels;
  }

  /**
   * 모든 여행 상세 조회
   */
  async findAllTravelDeep(): Promise<Travels[]> {
    const travels = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .leftJoinAndSelect('travels.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
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
  async findTravelDeep(id: bigint): Promise<Travels> {
    const travel = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .leftJoinAndSelect('travels.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
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
      .innerJoinAndSelect('travels.creator', 'users')
      .where('users._id = :userId', { userId })
      .getMany();

    if (!travels.length) {
      throw new Error(`No travels found for user with ID "${userId}"`);
    }

    return travels;
  }

  /**
   * 내가 공유 받은 여행 상세 조회
   */

  /**
   * userId로 여행 상세 조회
   *
   * @param userId
   */
  async findTravelsDeepByUserId(userId: bigint): Promise<Travels[]> {
    const travels = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .leftJoinAndSelect('travels.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
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
    const travel = await this.findTravelDeep(updateTravelDto.id);

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
      const travel = await this.findTravelDeep(id);
      if (travel.travelDetails.length) {
        const isRemoveTravelDetails =
          await this.travelDetailsService.removeTravelDetailsByTId(travel._id);
        if (!isRemoveTravelDetails) {
          throw new Error(
            `Failed to delete travel details with travel ID "${id}"`,
          );
        }
      }

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
