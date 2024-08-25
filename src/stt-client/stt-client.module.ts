import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SttClientFactory } from './stt-client.factory';
import { WhisperService } from './services/whisper.service';

@Module({
  imports: [ConfigModule],
  providers: [SttClientFactory, WhisperService],
  exports: [SttClientFactory],
})
export class SttClientModule {}
