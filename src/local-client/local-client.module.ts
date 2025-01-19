import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LocalClientFactory } from '@/local-client/local-client.factory';
import { KakaoLocalService } from '@/local-client/services/kakao-local.service';
import { LocalClientController } from '@/local-client/controllers/local-client.controller';

@Module({
  imports: [ConfigModule],
  controllers: [LocalClientController],
  providers: [LocalClientFactory, KakaoLocalService],
  exports: [LocalClientFactory, KakaoLocalService],
})
export class LocalClientModule {}
