import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bucket, Storage } from '@google-cloud/storage';
import { IStorageClient } from '../interfaces/storage-client.interface';
import { MediaUtil } from '@/common/utils/media.util';

@Injectable()
export class GcStorageService implements IStorageClient {
  private chunkSize = 5 * 1024 * 1024;
  private storage: Storage;
  bucket: Bucket;
  mediaUtil: MediaUtil;

  constructor(private configService: ConfigService) {
    const gcloudConfig: Record<string, any> = JSON.parse(
      this.configService.get<string>('GCLOUD_CONFIG') || '{}',
    );
    const projectId = gcloudConfig.project_id;
    if (!projectId) {
      throw new Error('GCP configuration is incomplete');
    }
    this.storage = new Storage({
      projectId,
      credentials: {
        client_email: gcloudConfig.client_email,
        private_key: gcloudConfig.private_key,
      },
    });
    const bucketName = this.configService.get<string>('GCP_STORAGE_BUCKET');
    if (!bucketName) {
      throw new Error('GCP_STORAGE_BUCKET is not defined');
    }
    this.bucket = this.storage.bucket(bucketName);
    this.mediaUtil = new MediaUtil();
  }

  async uploadFile(path: string, filePath: string): Promise<string> {
    const destination = await this.mediaUtil.getDestination(path, filePath);
    await this.bucket.upload(filePath, { destination });
    return destination;
  }

  async streamUploadFile(path: string, filePath: string): Promise<string> {
    const destination = await this.mediaUtil.getDestination(path, filePath);
    const bucketFile = this.bucket.file(destination);
    const readStream = await this.mediaUtil.createReadStream(filePath);
    const writeStream = bucketFile.createWriteStream({
      chunkSize: this.chunkSize,
    });

    await new Promise((resolve, reject) => {
      readStream.pipe(writeStream).on('error', reject).on('finish', resolve);
    });
    return destination;
  }

  async getFile(path: string): Promise<Buffer> {
    const [fileContents] = await this.bucket.file(path).download();
    return fileContents;
  }

  async deleteFile(path: string): Promise<void> {
    await this.bucket.file(path).delete();
  }
}
