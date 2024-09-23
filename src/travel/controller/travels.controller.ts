import { TravelsService } from '@/travel/service/travels.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTravelDto } from '@/travel/dto/create-travel.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Travels } from '@/travel/entities/travels.entity';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { getUserId } from '@/auth/utils/auth.util';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { UserGuard } from '@/auth/guards/user.guard';
import { UpdateTravelDto } from '@/travel/dto/update-travel.dto';

@Controller({
  path: 'travels',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('travels')
export class TravelsController {
  constructor(private readonly travelsService: TravelsService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '새로운 여행 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async create(@Body() createTravelDto: CreateTravelDto) {
    return await this.travelsService.createTravel(createTravelDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '모든 여행 조회 성공',
  })
  async findTravelAll(): Promise<Travels[]> {
    return await this.travelsService.findAllTravel();
  }

  @Get('deep')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 여행 상세 조회' })
  @ApiResponse({
    status: 201,
    description: '모든 여행 상세 조회 성공',
  })
  async findDeepTravelAll(): Promise<Travels[]> {
    return await this.travelsService.findAllTravelDeep();
  }

  @Get(':travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '특정 여행 상세 조회 성공',
  })
  async findTravel(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<Travels> {
    return await this.travelsService.findTravel(travelId);
  }

  @Get('deep/:travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행 상세 조회' })
  @ApiResponse({
    status: 201,
    description: '특정 여행 상세 조회 성공',
  })
  async findDeepTravel(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<Travels> {
    return await this.travelsService.findTravelDeep(travelId);
  }

  @Get('me/get')
  @ApiOperation({ summary: '나의 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '나의 여행 조회 성공',
  })
  async findTravelsByMe(@Req() req: AuthRequest): Promise<Travels[]> {
    const userId = getUserId(req);
    return await this.travelsService.findTravelsByUserId(userId);
  }

  @Get('me/deep')
  @ApiOperation({ summary: '나의 여행 상세 조회' })
  @ApiResponse({
    status: 201,
    description: '나의 여행 상세 조회 성공',
  })
  async findDeepTravelsByMe(@Req() req: AuthRequest): Promise<Travels[]> {
    const userId = getUserId(req);
    return await this.travelsService.findTravelsDeepByUserId(userId);
  }

  @Put()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '여행 수정' })
  @ApiResponse({
    status: 201,
    description: '여행 수정 성공',
  })
  async updateTravel(
    @Body() updateTravelDto: UpdateTravelDto,
  ): Promise<Travels> {
    return await this.travelsService.updateTravel(updateTravelDto);
  }

  @Delete(':travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '여행 삭제' })
  @ApiResponse({
    status: 201,
    description: '여행 삭제 성공',
  })
  async deleteTravel(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<boolean> {
    return await this.travelsService.deleteTravel(travelId);
  }
}
