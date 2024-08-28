import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOAuth2Client } from '../interfaces/oauth2-client.interface';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GcOAuth2Service implements IOAuth2Client {
  private oauth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const config = this.configService.get('GOOGLE_OAUTH2_CONFIG', '{}');
    const { web } = JSON.parse(config) || { web: {} };
    const clientId = web.client_id;
    const clientSecret = web.client_secret;

    const isProduction = process.env.NODE_ENV === 'production';
    const redirectUri = isProduction
      ? web.redirect_uris?.[1]
      : web.redirect_uris?.[0];

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google Cloud OAuth configuration is incomplete');
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async getAuthorizationUrl(scopes: string[], state?: string): Promise<string> {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'select_account',
    });
    return url;
  }

  async getToken(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  async revokeToken(token: string): Promise<void> {
    await this.oauth2Client.revokeToken(token);
  }
}
