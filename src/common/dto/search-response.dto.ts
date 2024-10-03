import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMeta {
  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  totalPages: number;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class SearchResponseDto<T> {
  @IsArray()
  contents: T[];

  @ValidateNested()
  @Type(() => SearchMeta)
  meta: SearchMeta;
}
