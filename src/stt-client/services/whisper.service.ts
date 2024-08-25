import { Injectable } from '@nestjs/common';
import { ISttClient } from '../interfaces/stt-client.interface';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { MediaUtil } from '@/common/utils/media.util';

@Injectable()
export class WhisperService implements ISttClient {
  private openai: OpenAI;
  private model = 'whisper-1';
  private mediaUtil = new MediaUtil();
  private minSecondsPerChunk = 600;
  private minSilenceDuration = 0.5;
  private silenceNoise = -30; //  dB

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in the configuration');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async transcribe(
    audioFilePath: string,
    options: Record<string, any> = {},
  ): Promise<Record<string, any>> {
    return this.transcribeFile(audioFilePath, options);
  }

  private async transcribeChunk(
    chunkPath: string,
    options: Record<string, any> = {},
  ): Promise<Record<string, any>> {
    return this.openai.audio.transcriptions.create({
      file: await this.mediaUtil.createReadStream(chunkPath),
      model: this.model,
      language: options.language || 'ko',
      response_format: options.response_format || 'verbose_json',
      prompt: `Divide the following text into segments, with each segment ending at the conclusion of a complete sentence. Preserve all original punctuation and capitalization. Number each segment sequentially:`,
    });
  }

  private async transcribeFile(
    audioFilePath: string,
    options: Record<string, any> = {},
  ): Promise<Record<string, any>> {
    const chunks = await this.splitFile(audioFilePath);

    // 병렬로 청크 처리하되 순서 유지
    const results = await Promise.all(
      chunks.map(async (chunk, index) => {
        try {
          const result = await this.transcribeChunk(chunk, options);
          return { index, result };
        } finally {
          await this.mediaUtil.cleanupTempFile(chunk);
        }
      }),
    );

    // 인덱스로 정렬
    results.sort((a, b) => a.index - b.index);

    return results.reduce(
      (acc, { result }) => {
        if (result.text) acc.text += ' ' + result.text;
        if (result.segments) {
          const lastSegment = acc.segments[acc.segments.length - 1] || {
            end: 0,
          };
          acc.segments = acc.segments.concat(
            result.segments.map((segment: any) => {
              return {
                start: lastSegment.end + segment.start,
                end: lastSegment.end + segment.end,
                text: segment.text,
              };
            }),
          );
        }
        return acc;
      },
      {
        text: '',
        segments: [],
      },
    );
  }

  private async splitFile(filePath: string): Promise<string[]> {
    const chunks: string[] = [];
    let chunkStartTime = 0;
    const duration = await this.mediaUtil.getAudioDuration(filePath);

    const silences = await this.mediaUtil.detectAllSilence(
      filePath,
      0,
      this.silenceNoise,
      this.minSilenceDuration,
    );

    while (chunkStartTime < duration) {
      const idealChunkStartTime = Math.min(
        chunkStartTime + this.minSecondsPerChunk,
        duration,
      );

      // 가장 가까운 무음 구간 찾기
      const nextSilence = silences.find(
        (silence) => silence.start > idealChunkStartTime,
      );
      let chunkEndTime: number;

      if (nextSilence) {
        chunkEndTime = nextSilence.end;
      } else {
        chunkEndTime = duration;
      }

      const chunkPath = await this.mediaUtil.extractAudioSegment(
        filePath,
        chunkStartTime,
        chunkEndTime,
        `${filePath}_chunk_${chunks.length}.mp3`,
      );
      chunks.push(chunkPath);

      // 다음 반복을 위해 chunkStartTime 업데이트
      chunkStartTime = chunkEndTime;
    }

    return chunks;
  }
}
