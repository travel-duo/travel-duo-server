import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptClientFactory } from './gpt-client.factory';
import { Claude35SonnetService } from './services/claude-3-5-sonnet.service';
import { Gpt4oMiniService } from './services/gpt-4o-mini.service';

@Module({
  imports: [ConfigModule],
  providers: [GptClientFactory, Claude35SonnetService, Gpt4oMiniService],
  exports: [GptClientFactory],
})
export class GptClientModule {}
