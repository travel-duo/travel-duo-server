import { Injectable } from '@nestjs/common';
import { GcOAuth2Service } from './services/gc-oauth2.service';
import { IOAuth2Client } from './interfaces/oauth2-client.interface';
import { KakaoOAuth2Service } from '@/oauth2-client/services/kakao-oauth2.service';

export enum OAuth2ServiceType {
  GOOGLE = 'google',
  KAKAO = 'kakao',
  // Add other OAuth2 service types here as needed
}

@Injectable()
export class OAuth2ClientFactory {
  constructor(
    private gcOAuth2Service: GcOAuth2Service,
    private kakaoOAuth2Service: KakaoOAuth2Service,
  ) {}

  getClient(clientType: OAuth2ServiceType): IOAuth2Client {
    switch (clientType) {
      case OAuth2ServiceType.GOOGLE:
        return this.gcOAuth2Service;
      case OAuth2ServiceType.KAKAO:
        return this.kakaoOAuth2Service;
      default:
        throw new Error(`Unsupported OAuth2 service type: ${clientType}`);
    }
  }
}
