import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@/user/entities/user.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        connectString: configService.get('DB_CONNECT_STRING'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        entities: [User],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        namingStrategy: new SnakeNamingStrategy(),
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
