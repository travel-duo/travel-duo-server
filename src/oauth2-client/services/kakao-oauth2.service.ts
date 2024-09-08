import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { IOAuth2Client } from '../interfaces/oauth2-client.interface';

@Injectable()
export class KakaoOAuth2Service
  extends PassportStrategy(Strategy, 'kakao')
  implements IOAuth2Client
{
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
      scope: ['profile_nickname', 'account_email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const { _json } = profile;
    const user = {
      id: _json.id,
      email: _json.kakao_account.email,
      name: _json.properties.nickname,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }

  async getAuthorizationUrl(scopes: string[], state: string): Promise<string> {
    const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
    const params = new URLSearchParams({
      client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
      redirect_uri: this.configService.get<string>('KAKAO_CALLBACK_URL'),
      response_type: 'code',
      scope: scopes.join(' '),
      state,
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async getToken(code: string): Promise<any> {
    // This method is not needed when using Passport, as it handles token exchange
    throw new Error('Method not implemented with Passport');
  }

  async refreshToken(refreshToken: string): Promise<any> {
    // Implement token refresh logic here
    // You may need to use a Kakao-specific library or axios for this
    throw new Error('Method not implemented');
  }

  async revokeToken(token: string): Promise<void> {
    // Implement token revocation logic here
    // You may need to use a Kakao-specific library or axios for this
    throw new Error('Method not implemented');
  }
}
