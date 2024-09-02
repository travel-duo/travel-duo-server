import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuth2ClientFactory } from './oauth2-client.factory';
import { GcOAuth2Service } from './services/gc-oauth2.service';

@Module({
  imports: [ConfigModule],
  providers: [OAuth2ClientFactory, GcOAuth2Service],
  exports: [OAuth2ClientFactory, GcOAuth2Service],
})
export class OAuth2ClientModule {}