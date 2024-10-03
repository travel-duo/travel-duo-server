import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SortDto {
  @ApiPropertyOptional({
    description: '정렬 변수',
    example: '_id',
    name: 'sort_by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = '_id';

  @ApiPropertyOptional({
    description: '정렬 순서',
    example: 'ASC',
    name: 'sort_order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
