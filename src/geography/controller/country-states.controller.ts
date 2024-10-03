import { CountryStatesService } from '@/geography/service/country-states.service';
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
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCountryStateDto } from '@/geography/dto/create-country-state.dto';
import { CountryStates } from '@/geography/entities/country-states.entity';
import { UserGuard } from '@/auth/guards/user.guard';
import { UpdateCountryStateDto } from '@/geography/dto/update-country-state-dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller({
  path: 'country-states',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('country-states')
export class CountryStatesController {
  constructor(private readonly countryStatesService: CountryStatesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '행정 구역 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createCountryState(
    @Body() createCountryStateDto: CreateCountryStateDto,
  ): Promise<CountryStates> {
    return await this.countryStatesService.createCountryState(
      createCountryStateDto,
    );
  }

  @Get()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '행정 구역 전체 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding all country states',
  })
  async findAllCountryStates(): Promise<CountryStates[]> {
    return await this.countryStatesService.findAllCountryStates();
  }

  @Get(':countryStateId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 행정 구역 조회' })
  @ApiResponse({
    status: 201,
    description: 'success of finding country states',
  })
  async findOneCountryState(
    @Param('countryStateId', ParseIntPipe) countryStateId: bigint,
  ): Promise<CountryStates> {
    return await this.countryStatesService.findOneCountryState(countryStateId);
  }

  @Put()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '행정 구역 수정' })
  @ApiResponse({
    status: 201,
    description: 'success of updating country states',
  })
  async updateCountryState(
    @Body() updateCountryStateDto: UpdateCountryStateDto,
  ): Promise<CountryStates> {
    return await this.countryStatesService.updateCountryState(
      updateCountryStateDto,
    );
  }

  @Delete(':countryStateId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '행정 구역 삭제' })
  @ApiResponse({
    status: 201,
    description: 'success of removing country states',
  })
  async removeCountryState(
    @Param('countryStateId', ParseIntPipe) countryStateId: bigint,
  ): Promise<boolean> {
    return await this.countryStatesService.removeCountryState(countryStateId);
  }
}
