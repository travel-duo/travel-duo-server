import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { IGptClient } from '@/gpt-client/interfaces/gpt-client.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Gpt4oMiniService implements IGptClient {
  private openai: OpenAI;
  private model = 'gpt-4o-mini';
  apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('OPENAI_API_KEY');
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async generateResponse(options: OpenAI.Chat.ChatCompletionCreateParams) {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0,
      messages: options.messages || [],
    });

    return response;
  }

  async generateStreamResponse(
    options: OpenAI.Chat.ChatCompletionCreateParams,
  ) {
    const stream = await this.openai.chat.completions.create({
      model: this.model,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0,
      messages: options.messages || [],
      stream: true,
    });

    return stream;
  }
}
