import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from '@/travel/enums/location-type';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTravelLocationDto {
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the travel location',
  })
  id: bigint;

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

  @IsDateString()
  @ApiProperty({
    example: '2024-02-01T00:00:00',
    description: 'start date of the travel detail',
  })
  startDate: Date;

  @IsDateString()
  @ApiProperty({
    example: '2024-02-02T00:00:00',
    description: 'end date of the travel detail',
  })
  endDate: Date;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the travel detail',
  })
  travelDetailId: bigint;

  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'town city id of the travel location',
  })
  townCityId: bigint;
}
