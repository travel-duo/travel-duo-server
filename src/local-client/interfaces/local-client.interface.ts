// local-client.interfaces.ts
/** --------------------------------------------------------------------------------
 *  공통 타입 정의
 * -------------------------------------------------------------------------------- */

/**
 * 메타 정보
 */
export interface Meta {
  total_count: number; // 검색된 문서 수
  pageable_count?: number; // total_count 중 노출 가능 문서 수
  is_end?: boolean; // 현재 페이지가 마지막 페이지인지 여부
  same_name?: SameName; // 지역 및 키워드 분석 정보 (키워드 검색, 카테고리 검색 시)
}

/**
 * same_name 타입: 질의어의 지역 및 키워드 분석 정보
 */
export interface SameName {
  region: string[];
  keyword: string;
  selected_region: string;
}

/**
 * 주소 검색 시 반환되는 'address'의 상세 정보
 */
export interface Address {
  address_name: string; // 전체 지번 주소
  region_1depth_name: string; // 시도 단위
  region_2depth_name: string; // 구 단위
  region_3depth_name: string; // 동 단위
  mountain_yn?: string; // 산 여부(Y/N)
  main_address_no?: string; // 지번 주번지
  sub_address_no?: string; // 지번 부번지(없으면 "")
  [key: string]: any; // 그 외 키들은 필요한 경우 추가
}

/**
 * 주소 검색 시 반환되는 'road_address'의 상세 정보(도로명 주소)
 */
export interface RoadAddress {
  address_name: string; // 전체 도로명 주소
  region_1depth_name: string; // 시도 단위
  region_2depth_name: string; // 구 단위
  region_3depth_name: string; // 읍/면/동 단위
  road_name: string; // 도로명
  underground_yn: string; // 지하 여부(Y/N)
  main_building_no: string; // 건물 본번
  sub_building_no: string; // 건물 부번(없으면 "")
  building_name: string; // 건물 이름
  zone_no: string; // 우편번호(5자리)
  [key: string]: any; // 그 외 키들은 필요한 경우 추가
}

/**
 * Document: 주소/좌표 변환 등에서 반환되는 문서 타입
 * 상황에 따라 공통 필드가 조금씩 다름
 */
export interface LocalDocument {
  // 공통
  x?: string; // 경도
  y?: string; // 위도

  // 주소 검색 시
  address_name?: string; // 전체 주소
  address_type?: string; // REGION(지명), ROAD(도로명), REGION_ADDR(지번), ROAD_ADDR(도로명주소)
  address?: Address; // 지번 주소 정보
  road_address?: RoadAddress; // 도로명 주소 정보

  // 좌표 -> 행정구역 변환
  region_type?: string; // H(행정동) 또는 B(법정동)
  code?: string; // region 코드
  region_1depth_name?: string;
  region_2depth_name?: string;
  region_3depth_name?: string;
  region_4depth_name?: string;

  // 키워드 검색, 카테고리 검색
  id?: string; // 장소 ID
  place_name?: string; // 장소명, 업체명
  category_name?: string; // 카테고리 이름
  category_group_code?: string; // 중요 카테고리 그룹 코드
  category_group_name?: string; // 중요 카테고리 그룹명
  phone?: string; // 전화번호
  address_name_for_place?: string; // (주의) 이미 address_name이 있으므로 별도 사용 시 alias
  road_address_name?: string; // 전체 도로명 주소
  place_url?: string; // 장소 상세 페이지 URL
  distance?: string; // 중심 좌표와의 거리 (단, x,y 파라미터 있는 경우)
}

/** --------------------------------------------------------------------------------
 *  각 API별 응답 타입
 * -------------------------------------------------------------------------------- */

/** 주소 검색 API 응답 타입 (GET /v2/local/search/address.{format}) */
export interface SearchAddressResponse {
  meta: Meta;
  documents: LocalDocument[];
}

/** 좌표 -> 행정구역 변환 API 응답 타입 (GET /v2/local/geo/coord2regioncode.{format}) */
export interface CoordToRegionCodeResponse {
  meta: Meta;
  documents: LocalDocument[];
}

/** 좌표 -> 주소 변환 API 응답 타입 (GET /v2/local/geo/coord2address.{format}) */
export interface CoordToAddressResponse {
  meta: Meta;
  documents: LocalDocument[];
}

/** 좌표 변환 API 응답 타입 (GET /v2/local/geo/transcoord.{format}) */
export interface TransCoordResponse {
  meta: Meta;
  documents: Array<{
    x: number; // 변환된 경도
    y: number; // 변환된 위도
  }>;
}

/** 키워드 검색 API 응답 타입 (GET /v2/local/search/keyword.{format}) */
export interface SearchKeywordResponse {
  meta: Meta;
  documents: LocalDocument[];
}

/** 카테고리 검색 API 응답 타입 (GET /v2/local/search/category.{format}) */
export interface SearchCategoryResponse {
  meta: Meta;
  documents: LocalDocument[];
}

/** --------------------------------------------------------------------------------
 *  카테고리 코드
 * -------------------------------------------------------------------------------- */
export type CategoryGroupCode =
  | 'MT1' // 대형마트
  | 'CS2' // 편의점
  | 'PS3' // 어린이집, 유치원
  | 'SC4' // 학교
  | 'AC5' // 학원
  | 'PK6' // 주차장
  | 'OL7' // 주유소, 충전소
  | 'SW8' // 지하철역
  | 'BK9' // 은행
  | 'CT1' // 문화시설
  | 'AG2' // 중개업소
  | 'PO3' // 공공기관
  | 'AT4' // 관광명소
  | 'AD5' // 숙박
  | 'FD6' // 음식점
  | 'CE7' // 카페
  | 'HP8' // 병원
  | 'PM9'; // 약국

/** --------------------------------------------------------------------------------
 *  KakaoLocalClient 인터페이스
 * -------------------------------------------------------------------------------- */

export interface LocalClient {
  /**
   * 주소 -> 좌표 변환
   * @param query 검색하고자 하는 주소(지번/도로명)
   * @param options 기타 파라미터 (analyze_type, page, size 등)
   */
  searchAddress(
    query: string,
    options?: {
      analyze_type?: 'similar' | 'exact';
      page?: number;
      size?: number;
      // 그 외 필요한 파라미터 추가
    },
  ): Promise<SearchAddressResponse>;

  /**
   * 좌표 -> 행정구역 변환
   * @param x 경도
   * @param y 위도
   * @param options input_coord, output_coord 등
   */
  coordToRegionCode(
    x: number,
    y: number,
    options?: {
      input_coord?: string;
      output_coord?: string;
      // 그 외 필요한 파라미터 추가
    },
  ): Promise<CoordToRegionCodeResponse>;

  /**
   * 좌표 -> 주소 변환
   * @param x 경도
   * @param y 위도
   * @param options input_coord(WGS84 등) 기본값: WGS84
   */
  coordToAddress(
    x: number,
    y: number,
    options?: {
      input_coord?: string;
    },
  ): Promise<CoordToAddressResponse>;

  /**
   * 좌표계 변환
   * @param x 변환할 좌표 X(경도)
   * @param y 변환할 좌표 Y(위도)
   * @param options input_coord, output_coord 등
   */
  transCoord(
    x: number,
    y: number,
    options?: {
      input_coord?: string;
      output_coord?: string;
      // 그 외 필요한 파라미터 추가
    },
  ): Promise<TransCoordResponse>;

  /**
   * 키워드로 장소 검색
   * @param query 검색어
   * @param options (x, y, radius 등)
   */
  searchKeyword(
    query: string,
    options?: {
      category_group_code?: CategoryGroupCode;
      x?: number; // 경도
      y?: number; // 위도
      radius?: number; // 중심 좌표부터의 반경거리 (단위: m)
      rect?: string; // 사각형 범위
      page?: number; // 1~45
      size?: number; // 1~15
      sort?: 'distance' | 'accuracy';
    },
  ): Promise<SearchKeywordResponse>;

  /**
   * 카테고리로 장소 검색
   * @param category_group_code 카테고리 코드
   * @param options (x, y, radius 등)
   */
  searchCategory(
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
  ): Promise<SearchCategoryResponse>;
}
