import { SearchFilterService } from '@/common/search-filter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { Repository } from 'typeorm';
import { CreateTravelsDto } from '@/travel/dto/create-travels.dto';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { fromZonedTime } from 'date-fns-tz';

@Injectable()
export class TravelsService extends SearchFilterService {
  constructor(
    @InjectRepository(Travels)
    private travelsRepository: Repository<Travels>,
    private userService: UserService,
  ) {
    super();
  }

  /**
   * 여행 생성
   * @param createTravelDto
   */
  async create(createTravelDto: CreateTravelsDto): Promise<Travels> {
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

  async fineAll(): Promise<Travels[]> {
    return await this.travelsRepository.find();
  }

  /**
   * 특정 여행 조회
   *
   * @param id
   */
  async findOne(id: bigint): Promise<Travels> {
    const travel = await this.travelsRepository.findOne({ where: { _id: id } });
    if (!travel) {
      throw new Error(`Travel with ID "${id}" not found`);
    }
    return travel;
  }

  /**
   * 내 여행 조회
   *
   * @param userId
   */
  async findTravelsByUserId(userId: bigint): Promise<Travels[]> {
    const travels = await this.travelsRepository
      .createQueryBuilder('travels')
      .leftJoin('travels.creator', 'users') // Join the creator (user)
      .where('users._id = :userId', { userId }) // Filter by user's _id
      .getMany();

    if (!travels.length) {
      throw new Error(`No travels found for user with ID "${userId}"`);
    }

    return travels;
  }
}
