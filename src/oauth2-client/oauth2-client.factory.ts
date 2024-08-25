import { Injectable } from '@nestjs/common';
import { GcOAuth2Service } from './services/gc-oauth2.service';
import { IOAuth2Client } from './interfaces/oauth2-client.interface';

export enum OAuth2ServiceType {
  GOOGLE = 'google',
  // Add other OAuth2 service types here as needed
}

@Injectable()
export class OAuth2ClientFactory {
  constructor(private gcOAuth2Service: GcOAuth2Service) {}

  getClient(clientType: OAuth2ServiceType): IOAuth2Client {
    switch (clientType) {
      case OAuth2ServiceType.GOOGLE:
        return this.gcOAuth2Service;
      default:
        throw new Error(`Unsupported OAuth2 service type: ${clientType}`);
    }
  }
}
