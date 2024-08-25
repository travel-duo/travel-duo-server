import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { IOcrClient } from '../interfaces/ocr-client.interface';

@Injectable()
export class GcVisionService implements IOcrClient {
  private client: ImageAnnotatorClient;

  constructor(private configService: ConfigService) {
    const gcloudConfig: Record<string, any> = JSON.parse(
      this.configService.get<string>('GCLOUD_CONFIG') || '{}',
    );
    const projectId = gcloudConfig.project_id;
    if (!projectId) {
      throw new Error('GCP configuration is incomplete');
    }
    this.client = new ImageAnnotatorClient({
      projectId,
      credentials: {
        client_email: gcloudConfig.client_email,
        private_key: gcloudConfig.private_key,
      },
    });
  }

  async detectText(imagePath: string): Promise<Record<string, any>> {
    try {
      const [result] = await this.client.textDetection(imagePath);
      const detections = result.textAnnotations;
      return {
        text: detections[0].description,
        words: detections.slice(1).map((detection) => {
          return {
            text: detection.description,
            boundingBox: detection.boundingPoly?.vertices,
          };
        }),
      };
    } catch (error) {
      console.error('Error detecting text:', error);
      throw new Error('Failed to detect text from image');
    }
  }
}
