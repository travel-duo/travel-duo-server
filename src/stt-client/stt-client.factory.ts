import { Injectable } from '@nestjs/common';
import { ISttClient } from './interfaces/stt-client.interface';
import { WhisperService } from './services/whisper.service';

export enum SttServiceType {
  WHISPER = 'whisper',
}

@Injectable()
export class SttClientFactory {
  constructor(private whisperService: WhisperService) {}

  getClient(clientType: SttServiceType): ISttClient {
    switch (clientType) {
      case SttServiceType.WHISPER:
        return this.whisperService;
      default:
        throw new Error(`Unsupported STT service type: ${clientType}`);
    }
  }
}
