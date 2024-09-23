import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateTravelDetailsDto {
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'id of the travel detail',
  })
  id: bigint;

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
}
