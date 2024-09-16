import { SearchFilterService } from '@/common/search-filter.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { Repository } from 'typeorm';
import { GeographyService } from '@/geography/geography.service';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { fromZonedTime } from 'date-fns-tz';
import {CreateTravelLocationsDto} from "@/travel/dto/create-travel-locations.dto";

@Injectable()
export class TravelLocationsService extends SearchFilterService {
  constructor(
    @InjectRepository(TravelLocations)
    private travelLocationsRepository: Repository<TravelLocations>,
    private travelDetailsService: TravelDetailsService,
    private townCityService: GeographyService,
  ) {
    super();
  }

  /**
   * 여행지 장소 생성
   * @param createTravelLocationsDto
   */
  async create(createTravelLocationsDto: CreateTravelLocationsDto): Promise<TravelLocations> {
    const { travelDetailId, townCityId, startDate, endDate, ...locationData } =
      createTravelLocationsDto;
    const travelDetails = await this.travelDetailsService.findOne(travelDetailId);
    const townCities = await this.townCityService.findOneTownCity(townCityId);

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
}
