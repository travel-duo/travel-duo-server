import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from '@/user/entities/users.entity';
import { Travels } from '@/travel/entities/travels.entity';
import { TravelMedias } from '@/travel/entities/travel-medias.entity';
import { TravelMembers } from '@/travel/entities/travel-members.entity';
import { Badges } from '@/badge/entities/badges.entity';
import { TravelDetails } from '@/travel/entities/travel-details.entity';
import { TravelLocations } from '@/travel/entities/travel-locations.entity';
import { TownCities } from '@/geography/entities/town-cities.entity';
import { CountryStates } from '@/geography/entities/country-states.entity';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 환경 변수 사용
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          Users,
          Travels,
          TravelMedias,
          TravelMembers,
          Badges,
          TravelDetails,
          TravelLocations,
          TownCities,
          CountryStates,
        ],
        synchronize: false, //configService.get<boolean>('DB_SYNCHRONIZE', false),
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
