import { SearchFilterService } from '@/common/search-filter.service';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTravelDetailsDto } from '@/travel/dto/create-travel-details.dto';
import { toZonedTime } from 'date-fns-tz';
import { TravelsService } from '@/travel/service/travels.service';

@Injectable()
export class TravelDetailsService extends SearchFilterService {
  constructor(
    @InjectRepository(TravelDetails)
    private travelDetailRepository: Repository<TravelDetails>,
    private travelsService: TravelsService,
  ) {
    super();
  }

  /**
   * 상세 여행 생성
   *
   * @param createTravelDetailDto
   */
  async create(
    createTravelDetailDto: CreateTravelDetailsDto,
  ): Promise<TravelDetails> {
    const { travelId, startDate, endDate, ...travelDetailData } =
      createTravelDetailDto;

    const travel = await this.travelsService.findDeepTravel(travelId);

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
   * 특정 상세 여행 조회
   *
   * @param id
   */
  async findOneTravelDetail(id: bigint): Promise<TravelDetails> {
    const travelDetail = await this.travelDetailRepository.findOne({
      where: { _id: id },
    });
    if (!travelDetail) {
      throw new Error(`TravelDetails with ID "${id}" not found`);
    }
    return travelDetail;
  }
}
