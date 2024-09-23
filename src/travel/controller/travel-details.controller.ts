import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { AdminGuard } from '@/auth/guards/admin.guard';

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
    return await this.travelDetailsService.createTravelDetail(
      createTravelDetailDto,
    );
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 상세 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '모든 상세 여행 조회 성공',
  })
  async findTravelDetailAll(): Promise<TravelDetails[]> {
    return await this.travelDetailsService.findAllTravelDetails();
  }

  @Get('deep')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 상세 여행 상세 조회' })
  @ApiResponse({
    status: 201,
    description: '모든 상세 여행 상세 조회 성공',
  })
  async findTravelDetailAllDeep(): Promise<TravelDetails[]> {
    return await this.travelDetailsService.findAllTravelDetailsDeep();
  }

  @Get(':travelDetailId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 상세 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '특정 상세 여행 조회 성공',
  })
  async findOneTravelDetail(
    @Param('travelDetailId', ParseIntPipe) travelDetailId: bigint,
  ): Promise<TravelDetails> {
    return await this.travelDetailsService.findOneTravelDetail(travelDetailId);
  }

  @Get(':travelDetailId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 상세 여행 상세 조회' })
  @ApiResponse({
    status: 201,
    description: '특정 상세 여행 상세 조회 성공',
  })
  async findOneTravelDetailDeep(
    @Param('travelDetailId', ParseIntPipe) travelDetailId: bigint,
  ): Promise<TravelDetails> {
    return await this.travelDetailsService.findOneTravelDetailDeep(
      travelDetailId,
    );
  }

  @Get('by-travel/:travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'travelId로 상세 여행들 조회' })
  @ApiResponse({
    status: 201,
    description: 'travelId로 상세 여행들 조회 성공',
  })
  async findTravelDetailsByTId(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<TravelDetails[]> {
    return await this.travelDetailsService.findTravelDetailsByTId(travelId);
  }

  @Get('deep/by-travel/:travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'travelId로 상세 여행들 상세 조회' })
  @ApiResponse({
    status: 201,
    description: 'travelId로 상세 여행들 상세 조회 성공',
  })
  async findTravelDetailsDeepByTId(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<TravelDetails[]> {
    return await this.travelDetailsService.findTravelDetailsDeepByTId(travelId);
  }

  /**
   * 특정 여행 삭제
   */
  @Delete(':travelDetailId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 상세 여행 삭제' })
  @ApiResponse({
    status: 201,
    description: '특정 상세 여행 삭제 성공',
  })
  async deleteTravelDetail(
    @Param('travelDetailId', ParseIntPipe) travelDetailId: bigint,
  ): Promise<boolean> {
    return await this.travelDetailsService.deleteTravelDetail(travelDetailId);
  }
}
