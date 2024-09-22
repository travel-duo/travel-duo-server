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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { CreateTownCityDto } from '@/geography/dto/create-town-city.dto';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { UserGuard } from '@/auth/guards/user.guard';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { getUserId } from '@/auth/utils/auth.util';
import { TownCitiesService } from '@/geography/service/town-cities.service';
import {UpdateTownCityDto} from "@/geography/dto/update-town-city.dto";

@Controller({
  path: 'town-cities',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('town-cities')
export class TownCitiesController {
  constructor(private readonly townCitiesService: TownCitiesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '시,군,구를 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createTownCity(
    @Body()
    createTownCityDto: CreateTownCityDto,
  ): Promise<TownCities> {
    return await this.townCitiesService.createTownCity(createTownCityDto);
  }

  @Get()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '시,군,구 전체 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding all town cities',
  })
  async findAllTownCities(): Promise<TownCities[]> {
    return await this.townCitiesService.findAllTownCities();
  }

  @Get(':townCityId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 시,군,구 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding town city',
  })
  async findOneTownCity(
    @Param('townCityId', ParseIntPipe)
    townCityId: bigint,
  ): Promise<TownCities> {
    return await this.townCitiesService.findOneTownCity(townCityId);
  }

  @Get('me')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '내가 방문한 도시들 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding my visited town cities',
  })
  async findMyVisitedTownCities(
    @Req()
    req: AuthRequest,
  ): Promise<TownCities[]> {
    const userId = getUserId(req);
    return await this.townCitiesService.findMyVisitedTownCities(userId);
  }

  @Get('me/number')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '내가 방문한 도시 수 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of counting my visited town cities',
  })
  async countVisitedTownCities(
    @Req()
    req: AuthRequest,
  ): Promise<number> {
    const userId = getUserId(req);
    return await this.townCitiesService.countVisitedTownCities(userId);
  }

  @Put()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '특정 시,군,구 수정' })
  @ApiResponse({
    status: 201,
    description: 'success of updating town city',
  })
  async updateTownCity(
    @Body() updateTownCityDto: UpdateTownCityDto,
  ): Promise<TownCities> {
    return await this.townCitiesService.updateTownCity(updateTownCityDto);
  }

  @Delete(':townCityId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '특정 시,군,구를 삭제' })
  @ApiResponse({
    status: 201,
    description: 'success of removing town city',
  })
  async removeTownCities(
    @Param('townCityId', ParseIntPipe)
    townCityId: bigint,
  ): Promise<boolean> {
    return await this.townCitiesService.removeTownCity(townCityId);
  }
}
