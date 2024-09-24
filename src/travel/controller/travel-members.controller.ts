import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { TravelMembersService } from '@/travel/service/travel-members.service';
import { CreateTravelMembersDto } from '@/travel/dto/create-travel-members.dto';
import { UserGuard } from '@/auth/guards/user.guard';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { getUserId } from '@/auth/utils/auth.util';

@Controller({
  path: 'travel-members',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('travel-members')
export class TravelMembersController {
  constructor(private readonly travelMembersService: TravelMembersService) {}

  /**
   * 여행 멤버 생성
   */
  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '여행 공유 하기' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createTravelMember(
    @Req() req: AuthRequest,
    @Body() createTravelMemberDto: CreateTravelMembersDto,
  ) {
    const travelCreatorId = getUserId(req);

    return await this.travelMembersService.createTravelMember(
      travelCreatorId,
      createTravelMemberDto,
    );
  }
}
