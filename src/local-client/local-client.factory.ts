import { Injectable } from '@nestjs/common';
import { KakaoLocalService } from '@/local-client/services/kakao-local.service';

export enum LocalClientType {
  KAKAO = 'kakao',
}

@Injectable()
export class LocalClientFactory {
  constructor(private kakaoLocalService: KakaoLocalService) {}

  getClient(clientType: LocalClientType) {
    switch (clientType) {
      case LocalClientType.KAKAO:
        return this.kakaoLocalService;
      default:
        throw new Error('Invalid client type');
    }
  }
}
