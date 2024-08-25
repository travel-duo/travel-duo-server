import { Injectable } from '@nestjs/common';
import { GcStorageService } from '@/storage-client/services/gc-storage.service';
import { IStorageClient } from '@/storage-client/interfaces/storage-client.interface';

export enum StorageServiceType {
  GCS = 'gcs',
}

@Injectable()
export class StorageClientFactory {
  constructor(private gcsService: GcStorageService) {}

  getClient(clientType: StorageServiceType): IStorageClient {
    switch (clientType) {
      case StorageServiceType.GCS:
        return this.gcsService;
      default:
        throw new Error(`Unsupported storage service type: ${clientType}`);
    }
  }
}
