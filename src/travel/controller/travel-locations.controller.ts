import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
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
import { AdminGuard } from '@/auth/guards/admin.guard';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { UpdateTravelLocationDto } from '@/travel/dto/update-travel-location.dto';

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
  @ApiOperation({ summary: '새로운 여행지 장소 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createTravelLocation(
    @Body() createTravelLocationsDto: CreateTravelLocationsDto,
  ) {
    return await this.travelLocationsService.createTravelLocation(
      createTravelLocationsDto,
    );
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 여행지 장소 조회' })
  @ApiResponse({
    status: 201,
    description: '모든 여행지 장소 조회 성공',
  })
  async findAllTravelLocations(): Promise<TravelLocations[]> {
    return await this.travelLocationsService.findAllTravelLocations();
  }

  @Get(':travelLocationId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행지 장소 조회' })
  @ApiResponse({
    status: 201,
    description: '특정 여행지 장소 조회 성공',
  })
  async findTravelLocation(
    @Param('travelLocationId', ParseIntPipe) travelLocationId: bigint,
  ): Promise<TravelLocations> {
    return await this.travelLocationsService.findOneTravelLocation(
      travelLocationId,
    );
  }

  @Get('by-travel-detail/:travelDetailId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'travelDetailId로 여행지 장소들 조회' })
  @ApiResponse({
    status: 201,
    description: 'travelDetailId로 여행지 장소들 조회 성공',
  })
  async findTravelLocationsByTDId(
    @Param('travelDetailId', ParseIntPipe) travelDetailId: bigint,
  ): Promise<TravelLocations[]> {
    return await this.travelLocationsService.findTravelLocationsByTDId(
      travelDetailId,
    );
  }

  @Put()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행지 장소 수정' })
  @ApiResponse({
    status: 201,
    description: '특정 여행지 장소 수정 성공',
  })
  async updateTravelLocation(
    @Body() updateTravelLocationsDto: UpdateTravelLocationDto,
  ): Promise<TravelLocations> {
    return await this.travelLocationsService.updateTravelLocation(
      updateTravelLocationsDto,
    );
  }

  @Delete(':travelLocationId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행지 장소 삭제' })
  @ApiResponse({
    status: 201,
    description: '특정 여행지 장소 삭제 성공',
  })
  async removeTravelLocation(
    @Param('travelLocationId', ParseIntPipe) travelLocationId: bigint,
  ): Promise<boolean> {
    return await this.travelLocationsService.removeTravelLocation(
      travelLocationId,
    );
  }

  @Delete('by-travel-detail/:travelDetailId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'travelDetailId로 여행지 장소들 삭제' })
  @ApiResponse({
    status: 200,
    description: 'travelDetailId로 여행지 장소들 삭제 성공',
  })
  async removeTravelLocationsByTDId(
    @Param('travelDetailId', ParseIntPipe) travelDetailId: bigint,
  ): Promise<boolean> {
    return await this.travelLocationsService.removeTravelLocationsByTDId(
      travelDetailId,
    );
  }
}
