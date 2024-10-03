import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTravelDto {
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'The id of the travel',
  })
  id: bigint;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'The shared status of the travel',
  })
  isShared: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'icon',
    description: 'The icon of the travel',
  })
  icon?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'title',
    description: 'The title of the travel',
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'description',
    description: 'The description of the travel',
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
}
