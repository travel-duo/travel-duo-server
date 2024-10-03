import { Module } from '@nestjs/common';
import { OcrClientFactory } from './ocr-client.factory';
import { GcVisionService } from './services/gc-vision.service';

@Module({
  providers: [GcVisionService, OcrClientFactory],
  exports: [OcrClientFactory, GcVisionService],
})
export class OcrClientModule {}
