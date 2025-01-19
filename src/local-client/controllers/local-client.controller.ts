import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import {
  LocalClientFactory,
  LocalClientType,
} from '@/local-client/local-client.factory';
import { LocalClient } from '@/local-client/interfaces/local-client.interface';

@ApiTags('local')
@Controller({
  path: 'local',
  version: '1',
})
export class LocalClientController {
  kakaoLocalService: LocalClient;

  constructor(private localClientFactory: LocalClientFactory) {
    this.kakaoLocalService = this.localClientFactory.getClient(
      LocalClientType.KAKAO,
    );
  }

  @Get('geo/coord2regioncode')
  @ApiOperation({
    summary: '좌표를 통해 주소를 얻음',
  })
  async getRegioncodeFromCoord(
    @Query('lon') x: number,
    @Query('lat') y: number,
  ) {
    return this.kakaoLocalService.coordToAddress(x, y);
  }
}
