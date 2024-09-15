import { SearchFilterService } from '@/common/search-filter.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Travels } from '@/travel/entities/travels.entity';
import { Repository } from 'typeorm';
import { CreateTravelDto } from '@/travel/dto/create-travel.dto';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/user/user.service';

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
  async create(createTravelDto: CreateTravelDto): Promise<Travels> {
    const { creatorId, ...travelData } = createTravelDto;
    const creator = await this.userService.findOne(creatorId);

    if (!creator) {
      throw new Error(`User with id ${creatorId} not found`);
    }

    const travel = this.travelsRepository.create({
      ...travelData,
      creator,
    });

    return await this.travelsRepository.save(travel);
  }
}
