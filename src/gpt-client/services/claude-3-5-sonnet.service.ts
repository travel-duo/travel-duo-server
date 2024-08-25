import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { IGptClient } from '@/gpt-client/interfaces/gpt-client.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Claude35SonnetService implements IGptClient {
  private anthropic: Anthropic;
  private model = 'claude-3-5-sonnet-20240620';
  apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  async generateResponse(options: Anthropic.MessageCreateParams) {
    return this.anthropic.messages.create({
      model: this.model,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0,
      system: options.system,
      messages: options.messages || [],
      stream: false,
    });
  }

  async generateStreamResponse(options: Anthropic.MessageCreateParams) {
    return this.anthropic.messages.create({
      model: this.model,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0,
      system: options.system,
      messages: options.messages || [],
      stream: true,
    });
  }
}
