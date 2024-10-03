import { Injectable } from '@nestjs/common';
import { Claude35SonnetService } from './services/claude-3-5-sonnet.service';
import { Gpt4oMiniService } from './services/gpt-4o-mini.service';
import { IGptClient } from './interfaces/gpt-client.interface';

export enum GptServiceType {
  CLAUDE_3_5 = 'claude-3-5',
  GPT_4O_MINI = 'gpt-4o-mini',
}

@Injectable()
export class GptClientFactory {
  constructor(
    private claude35SonnetService: Claude35SonnetService,
    private gpt4oMiniService: Gpt4oMiniService,
  ) {}

  getClient(clientType: GptServiceType): IGptClient {
    switch (clientType) {
      case GptServiceType.CLAUDE_3_5:
        return this.claude35SonnetService;
      case GptServiceType.GPT_4O_MINI:
        return this.gpt4oMiniService;
      default:
        throw new Error('Invalid client type');
    }
  }
}
