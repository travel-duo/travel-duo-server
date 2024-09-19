import { GeographyService } from '@/geography/geography.service';
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
import { CreateCountryStateDto } from '@/geography/dto/create-country-state.dto';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateTownCityDto } from '@/geography/dto/create-town-city.dto';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { getUserId } from '@/auth/utils/auth.util';
import { UserGuard } from '@/auth/guards/user.guard';
import { UpdateCountryStateDto } from '@/geography/dto/update-country-state-dto';

@Controller({
  path: 'geography',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Post('country-states')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '행정 구역 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createCountryState(
    @Body() createCountryStateDto: CreateCountryStateDto,
  ): Promise<CountryStates> {
    return await this.geographyService.createCountryState(
      createCountryStateDto,
    );
  }

  @Get('country-states')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '행정 구역 전체 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding all country states',
  })
  async findAllCountryStates(): Promise<CountryStates[]> {
    return await this.geographyService.findAllCountryStates();
  }

  @Get('country-states/:countryStateId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 행정 구역 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding country states',
  })
  async findOneCountryState(
    @Param('countryStateId', ParseIntPipe) countryStateId: bigint,
  ): Promise<CountryStates> {
    return await this.geographyService.findOneCountryState(countryStateId);
  }

  @Put('country-states')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '행정 구역 수정' })
  @ApiResponse({
    status: 201,
    description: 'success of updating country states',
  })
  async updateCountryState(
    @Body() updateCountryStateDto: UpdateCountryStateDto,
  ): Promise<CountryStates> {
    return await this.geographyService.updateCountryState(
      updateCountryStateDto,
    );
  }

  @Delete('country-states/:countryStateId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '행정 구역 삭제' })
  @ApiResponse({
    status: 201,
    description: 'success of removing country states',
  })
  async removeCountryState(
    @Param('countryStateId', ParseIntPipe) countryStateId: bigint,
  ): Promise<boolean> {
    return await this.geographyService.removeCountryState(countryStateId);
  }

  @Post('town-cities')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '시,군,구를 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createTownCity(
    @Body() createTownCityDto: CreateTownCityDto,
  ): Promise<TownCities> {
    return await this.geographyService.createTownCity(createTownCityDto);
  }

  @Get('town-cities/me')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '내가 방문한 도시들 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding my visited town cities',
  })
  async findMyVisitedTownCities(
    @Req() req: AuthRequest,
  ): Promise<TownCities[]> {
    const userId = getUserId(req);
    return await this.geographyService.findMyVisitedTownCities(userId);
  }

  @Get('town-cities/me/number')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '내가 방문한 도시 수 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of counting my visited town cities',
  })
  async countVisitedTownCities(@Req() req: AuthRequest): Promise<number> {
    const userId = getUserId(req);
    return await this.geographyService.countVisitedTownCities(userId);
  }
}
