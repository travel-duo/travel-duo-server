import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTravelDto {
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'shared status of the travel',
  })
  isShared: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'icon',
    description: 'icon of the travel',
  })
  icon?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'title',
    description: 'title of the travel',
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'description',
    description: 'description of the travel',
  })
  description?: string | null;

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
    description: 'creator id of the travel',
  })
  creatorId: bigint;
}
