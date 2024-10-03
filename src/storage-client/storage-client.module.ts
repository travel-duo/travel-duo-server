import { Module } from '@nestjs/common';
import { GcStorageService } from './services/gc-storage.service';
import { StorageClientFactory } from '@/storage-client/storage-client.factory';

@Module({
  providers: [GcStorageService, StorageClientFactory],
  exports: [GcStorageService, StorageClientFactory],
})
export class StorageClientModule {}
