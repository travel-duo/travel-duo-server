import { Injectable } from '@nestjs/common';
import { GcVisionService } from './services/gc-vision.service';
import { IOcrClient } from './interfaces/ocr-client.interface';

export enum OcrServiceType {
  GCV = 'gcv',
}

@Injectable()
export class OcrClientFactory {
  constructor(private gcVisionService: GcVisionService) {}

  getClient(clientType: OcrServiceType): IOcrClient {
    switch (clientType) {
      case OcrServiceType.GCV:
        return this.gcVisionService;
      default:
        throw new Error(`Unsupported OCR service type: ${clientType}`);
    }
  }
}
