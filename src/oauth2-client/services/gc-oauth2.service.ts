import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { IOAuth2Client } from '../interfaces/oauth2-client.interface';

@Injectable()
export class GcOAuth2Service
  extends PassportStrategy(Strategy, 'google')
  implements IOAuth2Client
{
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Here you can process the user profile and return the user data
    // This method will be called by Passport after successful authentication
    return {
      userId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      accessToken,
      refreshToken,
    };
  }

  async getAuthorizationUrl(scopes: string[], state: string): Promise<string> {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
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
    // You may need to use the google-auth-library for this
    throw new Error('Method not implemented');
  }

  async revokeToken(token: string): Promise<void> {
    // Implement token revocation logic here
    // You may need to use the google-auth-library for this
    throw new Error('Method not implemented');
  }
}
