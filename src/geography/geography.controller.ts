import { GeographyService } from '@/geography/geography.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'create country state' })
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

  @Post('town-cities')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'create town city' })
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
