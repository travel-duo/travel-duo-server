import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '@/user/user.module';
import { OAuth2ClientModule } from '@/oauth2-client/oauth2-client.module';
import { TravelsModule } from '@/travel/module/travels.module';
import { TravelDetailsModule } from '@/travel/module/travel-details.module';
import { TravelLocationsModule } from '@/travel/module/travel-locations.module';
import { CountryStatesModule } from '@/geography/module/country-states.module';
import { TownCitiesModule } from '@/geography/module/town-cities.module';
import { TravelMembersModule } from '@/travel/module/travel-members.module';
import { WeatherApiClientModules } from '@/weather-api-client/weather-api-client.modules';
import { LocalClientModule } from '@/local-client/local-client.module';
import { WeatherClientModule } from '@/weather-client/weather-client.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
    OAuth2ClientModule,
    CountryStatesModule,
    TownCitiesModule,
    TravelsModule,
    TravelDetailsModule,
    TravelLocationsModule,
    TravelMembersModule,
    WeatherApiClientModules,
    WeatherClientModule,
    LocalClientModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
