import { LocationType } from '@/travel/enums/location-type';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTravelLocationsDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'cafe',
    description: 'type of the travel location',
  })
  locationType?: LocationType | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'icon',
    description: 'icon of the travel location',
  })
  icon?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'title',
    description: 'title of the travel location',
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'description',
    description: 'description of the travel location',
  })
  description?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'address',
    description: 'address of the travel location',
  })
  address?: string | null;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: '127.1266546',
    description: 'longitude of the town city',
  })
  lon?: number | null;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: '37.420023',
    description: 'latitude of the town city',
  })
  lat?: number | null;

  @IsNumber()
  @ApiProperty({
    example: '1',
    description: 'The order index of the travel location',
  })
  orderIndex: number;

  @IsISO8601()
  @ApiProperty({
    example: '2024-02-01T00:00:00Z',
    description: 'start date of the travel in ISO8601 format',
  })
  startDate: string;

  @IsISO8601()
  @ApiProperty({
    example: '2024-02-02T00:00:00Z',
    description: 'end date of the travel in ISO8601 format',
  })
  endDate: string;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the travel detail',
  })
  travelDetailId: bigint;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the town city',
  })
  townCityId: bigint;
}
