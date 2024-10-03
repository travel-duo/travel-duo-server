import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
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
import { TravelMembersService } from '@/travel/service/travel-members.service';
import { CreateTravelMembersDto } from '@/travel/dto/create-travel-members.dto';
import { UserGuard } from '@/auth/guards/user.guard';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { getUserId } from '@/auth/utils/auth.util';
import { TravelMembers } from '@/travel/entities/travel-members.entity';

@Controller({
  path: 'travel-members',
  version: '1',
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('travel-members')
export class TravelMembersController {
  constructor(private readonly travelMembersService: TravelMembersService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '여행 공유 하기' })
  @ApiResponse({
    status: 200,
    description: '여행 공유 하기 성공',
  })
  async createTravelMember(
    @Req() req: AuthRequest,
    @Body() createTravelMemberDto: CreateTravelMembersDto,
  ): Promise<TravelMembers> {
    const travelCreatorId = getUserId(req);

    return await this.travelMembersService.createTravelMember(
      travelCreatorId,
      createTravelMemberDto,
    );
  }

  @Delete(':travelId/:deleteUserId')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '특정 멤버를 특정 여행 공유 해제' })
  @ApiResponse({
    status: 200,
    description: '특정 멤버를 특정 여행 공유 해제 성공',
  })
  async removeTravelMember(
    @Req() req: AuthRequest,
    @Param('deleteUserId', ParseIntPipe) deleteUserId: bigint,
    @Param('travelId', ParseIntPipe) travelId: bigint,
  ): Promise<boolean> {
    const travelCreatorId = getUserId(req);

    return await this.travelMembersService.removeTravelMember(
      travelCreatorId,
      deleteUserId,
      travelId,
    );
  }
}
