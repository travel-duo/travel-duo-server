import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { DatabaseModule } from './common/database.module';
import { AuthModule } from './auth/auth.module';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 ConfigModule을 사용할 수 있게 합니다.
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['config/.env.production', 'config/.env']
          : ['config/.env.local', 'config/.env'],
    }),
    AuthModule,
    DatabaseModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
