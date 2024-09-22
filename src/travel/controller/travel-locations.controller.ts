import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { TravelLocationsService } from '@/travel/service/travel-locations.service';
import { CreateTravelLocationsDto } from '@/travel/dto/create-travel-locations.dto';
import { UserGuard } from '@/auth/guards/user.guard';

@Controller({
  path: 'travel-locations',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('travel-locations')
export class TravelLocationsController {
  constructor(
    private readonly travelLocationsService: TravelLocationsService,
  ) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '새로운 여행 장소 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async create(@Body() createTravelLocationsDto: CreateTravelLocationsDto) {
    return await this.travelLocationsService.create(createTravelLocationsDto);
  }
}
