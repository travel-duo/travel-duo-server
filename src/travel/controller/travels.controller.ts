import { TravelsService } from '@/travel/service/travels.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTravelsDto } from '@/travel/dto/create-travels.dto';
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '새로운 여행 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async create(@Body() createTravelDto: CreateTravelsDto) {
    return await this.travelsService.create(createTravelDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '모든 여행 조회 성공',
  })
  async findAll(): Promise<Travels[]> {
    return await this.travelsService.fineAll();
  }

  @Get(':travelId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '특정 여행 조회 성공',
  })
  async findOne(
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<Travels> {
    return await this.travelsService.findOne(travelId);
  }

  @Get('me/get')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '나의 여행 조회' })
  @ApiResponse({
    status: 201,
    description: '나의 여행 조회 성공',
  })
  async findTravelsByUserId(@Req() req: AuthRequest): Promise<Travels[]> {
    const userId = getUserId(req);
    return await this.travelsService.findTravelsByUserId(userId);
  }
}
