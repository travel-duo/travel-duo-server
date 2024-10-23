import { SearchFilterService } from '@/common/search-filter.service';
import { Repository } from 'typeorm';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTravelMembersDto } from '@/travel/dto/create-travel-members.dto';
import { TravelsService } from '@/travel/service/travels.service';
import { UserService } from '@/user/user.service';
import { Users } from '@/user/entities/users.entity';
import { Travels } from '@/travel/entities/travels.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class TravelMembersService extends SearchFilterService {
  constructor(
    @InjectRepository(TravelMembers)
    private travelMembersRepository: Repository<TravelMembers>,
    @Inject(forwardRef(() => TravelsService))
    private travelService: TravelsService,
    private userService: UserService,
  ) {
    super();
  }

  private readonly logger = new Logger(TravelsService.name);

  /**
   * 여행 공유하기
   *
   * @param travelCreatorId
   * @param createTravelMemberDto
   */
  @Transactional()
  async createTravelMember(
    travelCreatorId: bigint,
    createTravelMemberDto: CreateTravelMembersDto,
  ): Promise<TravelMembers> {
    const { travelId, userId, ...memberData } = createTravelMemberDto;

    // 여행 생성자와 멤버가 같은 경우 에러 발생
    if (travelCreatorId === userId) {
      throw new Error('You cannot add yourself as a member');
    }

    // 여행 생성자 아이디와 여행 아이디로 여행 조회(여행 생성자가 여행을 생성했는지 확인)
    const travel = await this.travelService.findTravelByUIdAndTId(
      travelCreatorId,
      travelId,
    );

    // 여행공유 설정이 되어있지 않은 경우 에러 발생
    if (!travel.isShared) {
      throw new Error('This travel is not shared');
    }

    // 공유 받을 유저의 정보
    const user = await this.userService.findOne(userId);

    const member = this.travelMembersRepository.create({
      ...memberData,
      travel,
      user,
    });

    return await this.travelMembersRepository.save(member);
  }

  /**
   * 특정 멤버가 공유받은 여행들 간단 조회
   * 간단 조회는 우선 주석 처리함, 필요하면 다시 사용할것
   *
   * @param user
   */

  /**
   async findSharedTravelsByUser(user: Users): Promise<Travels[]> {
   const travelMembers = await this.travelMembersRepository
   .createQueryBuilder('travelMembers')
   .innerJoinAndSelect('travelMembers.travel', 'travels')
   .where('travelMembers.user_id = :userId', { userId: user._id })
   .getMany();

   if (!travelMembers.length) {
   return [];
   }

   return travelMembers.map((member) => member.travel);
   }
   */

  /**
   * 특정 멤버가 공유받은 여행 조회
   *
   * @param user
   * @param year 조회할 연도 입력(YYYY) 또는 null 이면 전체 조회
   */
  async findSharedTravelsByUser(
    user: Users,
    year?: number,
  ): Promise<Travels[]> {
    const query = this.travelMembersRepository
      .createQueryBuilder('travelMembers')
      .innerJoinAndSelect('travelMembers.travel', 'travels')
      .leftJoinAndSelect('travels.travelMembers', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .where('travelMembers.user_id = :userId', { userId: user._id });

    if (year !== null) {
      query.andWhere('EXTRACT(YEAR FROM travels.startDate) = :year', { year });
    }

    const travels = await query.getMany();
    return travels.map((member) => member.travel);
  }

  /**
   * 특정 멤버가 공유받은 가장 최근에 다녀온 여행 조회
   *
   * @param user
   */
  async findRecentSharedTravelByUser(user: Users): Promise<Travels> {
    const travel = await this.travelMembersRepository
      .createQueryBuilder('travelMembers')
      .innerJoinAndSelect('travelMembers.travel', 'travels')
      .where('travelMembers.user_id = :userId', { userId: user._id })
      .orderBy('travels.startDate', 'DESC')
      .getOne();

    if (!travel) {
      return null;
    }

    return travel.travel;
  }

  /**
   * 특정 멤버가 공유받은 여행들의 연도 리스트 조회
   *
   * @param user
   */
  async findYearSharedTravelsByUser(user: Users): Promise<number[]> {
    let years = await this.travelMembersRepository
      .createQueryBuilder('travelMembers')
      .innerJoin('travelMembers.travel', 'travels')
      .where('travelMembers.user_id = :userId', { userId: user._id })
      .select('EXTRACT(YEAR FROM travels.startDate)', 'year')
      .groupBy('year')
      .getRawMany();

    if (!years.length) {
      return [];
    }

    years = years.map((year) => parseInt(year.year, 10));

    return years;
  }

  /**
   * 특정 여행에 공유된 멤버 조회
   *
   * @param travel
   */
  async findTravelMembersByTravelId(travel: Travels): Promise<Users[]> {
    const travelMembers = await this.travelMembersRepository.find({
      where: { travel },
    });

    if (!travelMembers.length) {
      return [];
    }

    return travelMembers.map((member) => member.user);
  }

  /**
   * 특정 멤버를 특정 여행 공유 해제
   *
   * @param travelCreatorId
   * @param userId
   * @param travelId
   */
  @Transactional()
  async removeTravelMember(
    travelCreatorId: bigint,
    userId: bigint,
    travelId: bigint,
  ): Promise<boolean> {
    try {
      const user = await this.userService.findOne(userId);

      const travel = await this.travelService.findTravelByUIdAndTId(
        travelCreatorId,
        travelId,
      );

      const member = await this.travelMembersRepository.findOne({
        where: { travel, user },
      });

      if (!member) {
        throw new Error('Member not found');
      }

      await this.travelMembersRepository.remove(member);
    } catch (error) {
      this.logger.error(
        `Failed to delete TravelMembers with travelId ${travelId} and userId ${userId}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * 특정 여행에 공유된 멤버들 해제
   *
   * @param travel
   */
  @Transactional()
  async removeTravelMembersByT(travel: Travels): Promise<boolean> {
    try {
      await this.travelMembersRepository.delete({ travel });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete TravelMembers with travelId ${travel}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * 특정 멤버를 모든 여행 공유 해제
   *
   * @param user
   */
  @Transactional()
  async removeTravelMembersByU(user: Users): Promise<boolean> {
    try {
      await this.travelMembersRepository.delete({ user });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete TravelMembers with userId ${user}: ${error.message}`,
      );
      return false;
    }
  }
}
