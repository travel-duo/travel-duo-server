import { TravelsService } from '@/travel/service/travels.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateTravelsDto } from '@/travel/dto/create-travels.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

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
}
