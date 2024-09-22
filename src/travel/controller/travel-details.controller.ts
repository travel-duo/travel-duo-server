import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { TravelDetailsService } from '@/travel/service/travel-details.service';
import { CreateTravelDetailsDto } from '@/travel/dto/create-travel-details.dto';
import { UserGuard } from '@/auth/guards/user.guard';

@Controller({
  path: 'travel-details',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('travel-details')
export class TravelDetailsController {
  constructor(private readonly travelDetailsService: TravelDetailsService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '새로운 상세 여행 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async create(@Body() createTravelDetailDto: CreateTravelDetailsDto) {
    return await this.travelDetailsService.create(createTravelDetailDto);
  }
}
