import { SearchFilterService } from '@/common/search-filter.service';
import { Repository } from 'typeorm';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateTravelMembersDto } from '@/travel/dto/create-travel-members.dto';
import { TravelsService } from '@/travel/service/travels.service';
import { UserService } from '@/user/user.service';
import { Users } from '@/user/entities/users.entity';
import { Travels } from '@/travel/entities/travels.entity';

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

  /**
   * 여행 공유하기
   *
   * @param travelCreatorId
   * @param createTravelMemberDto
   */
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
   * user가 공유받은 travel들 조회
   *
   * @param user
   */
  async findSharedTravelsByUserId(user: Users): Promise<Travels[]> {
    const travelMembers = await this.travelMembersRepository.find({
      where: { user },
    });

    if (!travelMembers.length) {
      return [];
    }

    return travelMembers.map((member) => member.travel);
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
}
