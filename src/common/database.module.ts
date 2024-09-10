import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Users } from '@/user/entities/users.entity';
import { Travels } from '@/travels/entities/travels.entity';
import { TravelMedias } from '@/travel-medias/entities/travel-medias.entity';
import { TravelMembers } from '@/travel-members/entities/travel-members.entity';
import { Badges } from '@/badges/entities/badges.entity';
import { TravelDetails } from '@/travel-details/entities/travel-details.entity';
import { Locations } from '@/locations/entities/locations.entity';
import { TownCities } from '@/town-cities/entities/town-cities.entity';
import { CountryStates } from '@/country-states/entities/country-states.entity';

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
          Locations,
          TownCities,
          CountryStates,
        ],
        synchronize: true, //configService.get<boolean>('DB_SYNCHRONIZE', false),
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
