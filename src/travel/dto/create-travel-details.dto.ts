import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateTravelDetailsDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'icon',
    description: 'icon of the travel detail',
  })
  icon?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Day-1',
    description: 'title of the travel detail',
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'description',
    description: 'description of the travel detail',
  })
  description: string | null;

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
    description: 'id of the travel',
  })
  travelId: bigint;
}
