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
import { Transactional } from 'typeorm-transactional';
import { UpdateTravelDto } from '@/travel/dto/update-travel.dto';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { TravelMembersService } from '@/travel/service/travel-members.service';
import { Users } from '@/user/entities/users.entity';
import { TownCitiesService } from '@/geography/service/town-cities.service';

@Injectable()
export class TravelsService extends SearchFilterService {
  constructor(
    @InjectRepository(Travels)
    private travelsRepository: Repository<Travels>,
    private userService: UserService,
    @Inject(forwardRef(() => TravelDetailsService))
    private travelDetailsService: TravelDetailsService,
    @Inject(forwardRef(() => TravelMembersService))
    private travelMembersService: TravelMembersService,
    @Inject(forwardRef(() => TownCitiesService))
    private townCitiesService: TownCitiesService,
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

    const travel = this.travelsRepository.create({
      ...travelData,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
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
      .leftJoinAndSelect('travels.travelMembers', 'travelMembers')
      .leftJoinAndSelect('travelMembers.user', 'members')
      .leftJoinAndSelect('travels.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      // .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('travels.townCities', 'townCities')
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
   * @param travelId
   */
  async findTravel(travelId: bigint): Promise<Travels> {
    const travel = await this.travelsRepository.findOneBy({ _id: travelId });

    if (!travel) {
      throw new Error(`Travel with ID "${travelId}" not found`);
    }

    return travel;
  }

  /**
   * 특정 여행 상세 조회
   *
   * @param travelId
   */
  async findTravelDeep(travelId: bigint): Promise<Travels> {
    const travel = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .leftJoinAndSelect('travels.townCities', 'townCities')
      .leftJoinAndSelect('travels.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      // .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .where('travels._id = :id', { id: travelId })
      .getOne();

    if (!travel) {
      throw new Error(`Travel with ID "${travelId}" not found`);
    }

    return travel;
  }

  /**
   * userId로 생성한 여행 조회
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
   * userId로 생성한 여행 상세 조회
   *
   * @param userId
   * @param year
   */
  async findTravelsDeepByUserId(
    userId: bigint,
    year?: number,
  ): Promise<Travels[]> {
    const queryBuilder = this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .innerJoinAndSelect('travels.townCities', 'townCities')
      .leftJoinAndSelect('travels.travelDetails', 'travelDetails')
      .leftJoinAndSelect('travelDetails.locations', 'travelLocations')
      // .leftJoinAndSelect('travelLocations.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .where('users._id = :userId', { userId });

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM travels.startDate) = :year', {
        year,
      });
    }

    const travels = await queryBuilder.getMany();

    if (!travels.length) {
      throw new Error(`No travels found for user with ID "${userId}"`);
    }

    return travels;
  }

  /**
   * userId로 가장 최근에 다녀온 내가 생성한 여행 조회
   */
  async findRecentTravelByUserId(userId: bigint): Promise<Travels> {
    const travel = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .innerJoinAndSelect('travels.townCities', 'townCities')
      .leftJoinAndSelect('townCities.countryState', 'countryState')
      .where('users._id = :userId', { userId })
      .orderBy('travels.startDate', 'DESC')
      .getOne();

    if (!travel) {
      throw new Error(`No recent travel found for user with ID "${userId}"`);
    }

    return travel;
  }

  /**
   * userId와 travelId로 생성한 여행 조회
   *
   * @param userId
   * @param travelId
   */
  async findTravelByUIdAndTId(
    userId: bigint,
    travelId: bigint,
  ): Promise<Travels> {
    const travel = await this.travelsRepository
      .createQueryBuilder('travels')
      .innerJoinAndSelect('travels.creator', 'users')
      .innerJoinAndSelect('travels.townCities', 'townCities')
      .where('users._id = :userId', { userId })
      .andWhere('travels._id = :travelId', { travelId })
      .getOne();

    if (!travel) {
      throw new Error(
        `No travel found for user with ID "${userId}" and travel ID "${travelId}"`,
      );
    }

    return travel;
  }

  /**
   * userId로 공유 받은 여행 조회
   *
   * @param userId
   * @param year
   */
  async findSharedTravelsByUser(
    userId: bigint,
    year?: number,
  ): Promise<Travels[]> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    return this.travelMembersService.findSharedTravelsByUser(user, year);
  }

  /**
   * 특정 멤버가 공유받은 가장 최근에 다녀온 여행 조회
   *
   * @param userId
   */
  async findRecentSharedTravelByUser(userId: bigint): Promise<Travels> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    return await this.travelMembersService.findRecentSharedTravelByUser(user);
  }

  /**
   * 특정 멤버가 공유받은 여행들의 연도 리스트 조회
   *
   * @param userId
   */
  async findYearSharedTravelsByUser(userId: bigint): Promise<number[]> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    return this.travelMembersService.findYearSharedTravelsByUser(user);
  }

  async findYearCreatedTravelsByUser(userId: bigint): Promise<number[]> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    let years = await this.travelsRepository
      .createQueryBuilder('travels')
      .where('creator_id = :userId', { userId })
      .select('DISTINCT EXTRACT(YEAR FROM travels.startDate)', 'year')
      .getRawMany();

    if (!years.length) {
      return [];
    }

    years = years.map((year) => parseInt(year.year, 10));

    return years;
  }

  /**
   * travelId로 공유된 멤버 조회
   *
   * @param userId
   * @param travelId
   */
  async findTravelMembersByTravelId(
    userId: bigint,
    travelId: bigint,
  ): Promise<Users[]> {
    const travel = await this.findTravelByUIdAndTId(userId, travelId);
    return this.travelMembersService.findTravelMembersByTravelId(travel);
  }

  /**
   * 여행 업데이트
   *
   * @param updateTravelDto
   */
  @Transactional()
  async updateTravel(updateTravelDto: UpdateTravelDto): Promise<Travels> {
    const { startDate, endDate, travelDetails, ...travelData } =
      updateTravelDto;
    const travel = await this.findTravelDeep(updateTravelDto.id);

    if (!travel) {
      throw new NotFoundException(
        `Travel with id ${updateTravelDto.id} not found`,
      );
    }

    Object.assign(travel, {
      ...travelData,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (travelDetails) {
      // 기존 travelDetails를 유지하면서 업데이트
      travel.travelDetails = travel.travelDetails.map((existingDetail) => {
        const updatedDetail = travelDetails.find(
          (detail) => detail._id === existingDetail._id,
        );
        return updatedDetail
          ? { ...existingDetail, ...updatedDetail }
          : existingDetail;
      });
    }

    return await this.travelsRepository.save(travel);
  }

  /**
   * 여행 삭제
   *
   * @param travelId
   */
  @Transactional()
  async deleteTravel(travelId: bigint): Promise<boolean> {
    try {
      const travel = await this.findTravelDeep(travelId);

      // 공유된 멤버들 해제
      const isRemoveTravelMembers =
        this.travelMembersService.removeTravelMembersByT(travel);
      if (!isRemoveTravelMembers) {
        throw new Error(
          `Failed to delete travel members with travel ID "${travelId}"`,
        );
      }

      if (travel.travelDetails.length) {
        const isRemoveTravelDetails =
          await this.travelDetailsService.removeTravelDetailsByTId(travel._id);
        if (!isRemoveTravelDetails) {
          throw new Error(
            `Failed to delete travel details with travel ID "${travelId}"`,
          );
        }
      }

      await this.travelsRepository.remove(travel);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete travel with ID "${travelId}": ${error.message}`,
      );
      return false;
    }
  }

  // 도시 추가
  async addTownCitiesToTravel(
    travelId: bigint,
    townCityIds: bigint[],
  ): Promise<Travels> {
    const travel = await this.travelsRepository.findOne({
      where: { _id: travelId },
      relations: ['townCities'],
    });

    if (!travel) {
      throw new Error(`Travel with ID "${travelId}" not found`);
    }

    const townCities = await this.townCitiesService.findByIds(townCityIds);

    // 기존 townCities 배열이 없다면 초기화
    if (!travel.townCities) {
      travel.townCities = [];
    }

    // 새로운 townCities 추가
    travel.townCities.push(...townCities);

    return this.travelsRepository.save(travel);
  }

  // 도시 제거
  async removeTownCitiesFromTravel(
    travelId: bigint,
    townCityIds: bigint[],
  ): Promise<Travels> {
    const travel = await this.travelsRepository.findOne({
      where: { _id: travelId },
      relations: ['townCities'],
    });

    if (!travel) {
      throw new Error(`Travel with ID "${travelId}" not found`);
    }

    // 제거할 townCityIds를 제외한 나머지만 필터링
    travel.townCities = travel.townCities.filter(
      (city) => !townCityIds.includes(city._id),
    );

    return this.travelsRepository.save(travel);
  }

  // 도시 전체 업데이트 (기존 관계를 모두 덮어씀)
  async updateTownCitiesForTravel(
    travelId: bigint,
    townCityIds: bigint[],
  ): Promise<Travels> {
    const travel = await this.travelsRepository.findOne({
      where: { _id: travelId },
      relations: ['townCities'],
    });

    if (!travel) {
      throw new Error(`Travel with ID "${travelId}" not found`);
    }

    const townCities = await this.townCitiesService.findByIds(townCityIds);

    // 기존 관계를 모두 새로운 관계로 교체
    travel.townCities = townCities;

    return this.travelsRepository.save(travel);
  }
}
