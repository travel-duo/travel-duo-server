import { TravelsService } from '@/travel/service/travels.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTravelDto } from '@/travel/dto/create-travel.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
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
import { Users } from '@/user/entities/users.entity';

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
    status: 200,
    description: 'The record has been successfully created.',
  })
  async create(@Body() createTravelDto: CreateTravelDto) {
    return await this.travelsService.createTravel(createTravelDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 여행 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 여행 조회 성공',
  })
  async findTravelAll(): Promise<Travels[]> {
    return await this.travelsService.findAllTravel();
  }

  @Get('deep')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 여행 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 여행 상세 조회 성공',
  })
  async findDeepTravelAll(): Promise<Travels[]> {
    return await this.travelsService.findAllTravelDeep();
  }

  @Get(':travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행 조회' })
  @ApiResponse({
    status: 200,
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
    status: 200,
    description: '특정 여행 상세 조회 성공',
  })
  async findDeepTravel(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<Travels> {
    return await this.travelsService.findTravelDeep(travelId);
  }

  @Get('me/get')
  @ApiOperation({ summary: '내가 생성한 여행 조회' })
  @ApiResponse({
    status: 200,
    description: '내가 생성한 조회 성공',
  })
  async findTravelsByMe(@Req() req: AuthRequest): Promise<Travels[]> {
    const userId = getUserId(req);
    return await this.travelsService.findTravelsByUserId(userId);
  }

  @Get('me/deep')
  @ApiOperation({ summary: '내가 생성한 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '내가 생성한 상세 조회 성공',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '조회할 연도 입력(YYYY) 또는 미입력시 전체 조회',
  })
  async findDeepTravelsByMe(
    @Req() req: AuthRequest,
    @Query('year', new DefaultValuePipe(null))
    year?: number,
  ): Promise<Travels[]> {
    const userId = getUserId(req);
    return await this.travelsService.findTravelsDeepByUserId(userId, year);
  }

  @Get('me/recent')
  @ApiOperation({ summary: '가장 최근에 다녀온 내가 생성한 여행 조회' })
  @ApiResponse({
    status: 200,
    description: '가장 최근에 다녀온 내가 생성한 여행 조회 성공',
  })
  async findRecentTravelByUserId(@Req() req: AuthRequest): Promise<Travels> {
    const userId = getUserId(req);
    return await this.travelsService.findRecentTravelByUserId(userId);
  }

  @Get('me/shared')
  @ApiOperation({ summary: '내가 공유 받은 여행 조회' })
  @ApiResponse({
    status: 200,
    description: '내가 공유 받은 여행 조회 성공',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '조회할 연도 입력(YYYY) 또는 미입력시 전체 조회',
  })
  async findSharedTravelsByMe(
    @Req() req: AuthRequest,
    @Query('year', new DefaultValuePipe(null))
    year?: number,
  ): Promise<Travels[]> {
    const userId = getUserId(req);
    return await this.travelsService.findSharedTravelsByUser(userId, year);
  }

  @Get('me/shared/recent')
  @UseGuards(UserGuard)
  @ApiOperation({
    summary: '내가 공유 받은 여행 중 가장 최근에 다녀온 여행 조회',
  })
  @ApiResponse({
    status: 200,
    description: '내가 공유 받은 여행 중 가장 최근에 다녀온 여행 조회 성공',
  })
  async findRecentSharedTravelByUser(
    @Req() req: AuthRequest,
  ): Promise<Travels> {
    const userId = getUserId(req);
    return await this.travelsService.findRecentSharedTravelByUser(userId);
  }

  @Get('me/shared/years')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '내가 공유 받은 여행의 연도 리스트 조회' })
  @ApiResponse({
    status: 200,
    description: '내가 공유 받은 여행의 연도 리스트 조회 성공',
  })
  async findYearSharedTravelsByMe(@Req() req: AuthRequest): Promise<number[]> {
    const userId = getUserId(req);
    return await this.travelsService.findYearSharedTravelsByUser(userId);
  }

  @Get('me/created/years')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '내가 생성한 여행의 연도 리스트 조회' })
  @ApiResponse({
    status: 200,
    description: '내가 생성한 여행의 연도 리스트 조회 성공',
  })
  async findYearCreatedTravelsByMe(@Req() req: AuthRequest): Promise<number[]> {
    const userId = getUserId(req);
    return await this.travelsService.findYearCreatedTravelsByUser(userId);
  }

  @Get(':travelId/members')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'travelId로 공유된 멤버 조회' })
  @ApiResponse({
    status: 200,
    description: 'travelId로 공유된 멤버 조회 성공',
  })
  async findTravelMembersByTravelId(
    @Req() req: AuthRequest,
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<Users[]> {
    const userId = getUserId(req);
    return await this.travelsService.findTravelMembersByTravelId(
      userId,
      travelId,
    );
  }

  @Put()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '여행 수정' })
  @ApiResponse({
    status: 200,
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
    status: 200,
    description: '여행 삭제 성공',
  })
  async deleteTravel(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<boolean> {
    return await this.travelsService.deleteTravel(travelId);
  }

  // 도시 전체 업데이트
  @Put(':travelId/town-cities')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '지역 수정' })
  updateTownCities(
    @Param('travelId') travelId: bigint,
    @Body() dto: { townCityIds: bigint[] },
  ) {
    return this.travelsService.updateTownCitiesForTravel(
      travelId,
      dto.townCityIds,
    );
  }
}
