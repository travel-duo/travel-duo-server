// kakao-local.service.ts

import axios, { AxiosInstance } from 'axios';
import {
  CategoryGroupCode,
  CoordToAddressResponse,
  CoordToRegionCodeResponse,
  LocalClient,
  SearchAddressResponse,
  SearchCategoryResponse,
  SearchKeywordResponse,
  TransCoordResponse,
} from '@/local-client/interfaces/local-client.interface';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

/**
 * KakaoLocalService
 * KakaoLocalClient 인터페이스를 axios를 이용해 구현한 예시입니다.
 */
@Injectable()
export class KakaoLocalService implements LocalClient {
  private readonly baseUrl = 'https://dapi.kakao.com';
  private readonly axios: AxiosInstance;
  private readonly restApiKey: string;

  constructor(private configService: ConfigService) {
    this.restApiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `KakaoAK ${this.restApiKey}`,
      },
    });
  }

  /**
   * 주소 -> 좌표 변환
   */
  async searchAddress(
    query: string,
    options?: {
      analyze_type?: 'similar' | 'exact';
      page?: number;
      size?: number;
      // 그 외 필요한 파라미터 추가
    },
  ): Promise<SearchAddressResponse> {
    const params = {
      query,
      ...options,
    };

    const { data } = await this.axios.get<SearchAddressResponse>(
      '/v2/local/search/address.json',
      { params },
    );
    return data;
  }

  /**
   * 좌표 -> 행정구역 변환
   */
  async coordToRegionCode(
    x: number,
    y: number,
    options?: {
      input_coord?: string;
      output_coord?: string;
      // 그 외 필요한 파라미터 추가
    },
  ): Promise<CoordToRegionCodeResponse> {
    const params = {
      x,
      y,
      ...options,
    };

    const { data } = await this.axios.get<CoordToRegionCodeResponse>(
      '/v2/local/geo/coord2regioncode.json',
      { params },
    );
    return data;
  }

  /**
   * 좌표 -> 주소 변환
   */
  async coordToAddress(
    x: number,
    y: number,
    options?: {
      input_coord?: string;
    },
  ): Promise<CoordToAddressResponse> {
    const params = {
      x,
      y,
      ...options,
    };

    const { data } = await this.axios.get<CoordToAddressResponse>(
      '/v2/local/geo/coord2address.json',
      { params },
    );
    return data;
  }

  /**
   * 좌표계 변환
   */
  async transCoord(
    x: number,
    y: number,
    options?: {
      input_coord?: string;
      output_coord?: string;
      // 그 외 필요한 파라미터 추가
    },
  ): Promise<TransCoordResponse> {
    const params = {
      x,
      y,
      ...options,
    };

    const { data } = await this.axios.get<TransCoordResponse>(
      '/v2/local/geo/transcoord.json',
      { params },
    );
    return data;
  }

  /**
   * 키워드로 장소 검색
   */
  async searchKeyword(
    query: string,
    options?: {
      category_group_code?: CategoryGroupCode;
      x?: number;
      y?: number;
      radius?: number;
      rect?: string;
      page?: number;
      size?: number;
      sort?: 'distance' | 'accuracy';
    },
  ): Promise<SearchKeywordResponse> {
    const params = {
      query,
      ...options,
    };

    const { data } = await this.axios.get<SearchKeywordResponse>(
      '/v2/local/search/keyword.json',
      { params },
    );
    return data;
  }

  /**
   * 카테고리로 장소 검색
   */
  async searchCategory(
    category_group_code: CategoryGroupCode,
    options?: {
      x?: number;
      y?: number;
      radius?: number;
      rect?: string;
      page?: number;
      size?: number;
      sort?: 'distance' | 'accuracy';
    },
  ): Promise<SearchCategoryResponse> {
    // 주의: category_group_code가 필수
    const params = {
      category_group_code,
      ...options,
    };

    const { data } = await this.axios.get<SearchCategoryResponse>(
      '/v2/local/search/category.json',
      { params },
    );
    return data;
  }
}
