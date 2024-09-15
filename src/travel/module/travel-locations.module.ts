import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Users} from "@/user/entities/users.entity";
import {Travels} from "@/travel/entities/travels.entity";
import {TravelDetails} from "@/travel/entities/travel-details.entity";
import {TownCities} from "@/geography/entities/town-cities.entity";
import {CountryStates} from "@/geography/entities/country-states.entity";
import {TravelLocationsController} from "@/travel/controller/travel-locations.controller";
import {TravelLocationsService} from "@/travel/service/travel-locations.service";
import {UserService} from "@/user/user.service";
import {TravelsService} from "@/travel/service/travels.service";
import {TravelDetailsService} from "@/travel/service/travel-details.service";
import {GeographyService} from "@/geography/geography.service";
import {TravelLocations} from "@/travel/entities/travel-locations.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Users, Travels, TravelDetails, TravelLocations, TownCities, CountryStates])],
    controllers: [TravelLocationsController],
    providers: [UserService, TravelsService, TravelDetailsService, TravelLocationsService, GeographyService],
    exports: [TravelLocationsService],
})
export class TravelLocationsModule {
}