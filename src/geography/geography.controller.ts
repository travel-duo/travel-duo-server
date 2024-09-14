import { GeographyService } from '@/geography/geography.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
  // @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'country-states 생성' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createCountryState(
    @Body() createCountryStateDto: CreateCountryStateDto,
  ): Promise<CountryStates> {
    return this.geographyService.createCountryState(createCountryStateDto);
  }
}
