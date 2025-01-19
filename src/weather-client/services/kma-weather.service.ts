import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  CurrentWeather,
  WeatherClient,
  WeatherForecast,
} from '@/weather-client/interfaces/weather-client.interface';
import { WeatherGridConverter } from '@/weather-client/converters/weather-grid.converter';
import * as dayjs from 'dayjs';
import { Like, Repository } from 'typeorm';
import { TownCities } from '@/geography/entities/town-cities.entity';
import {
  LocalClientFactory,
  LocalClientType,
} from '@/local-client/local-client.factory';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * KmaWeatherService
 * 기상청 OpenAPI를 통해 WeatherClient 인터페이스를 구현하는 예시입니다.
 */
@Injectable()
export class KmaWeatherService implements WeatherClient {
  private readonly logger = new Logger(KmaWeatherService.name);
  private readonly apiEndpoint: string;
  private readonly apiKey: string;
  private readonly axios: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private weatherGridConverter: WeatherGridConverter,
    @InjectRepository(TownCities)
    private townCitiesRepository: Repository<TownCities>,
    private localClientFactory: LocalClientFactory,
  ) {
    this.apiEndpoint = this.configService.get<string>('WEATHER_API_ENDPOINT');
    this.apiKey = this.configService.get<string>('WEATHER_SERVICE_KEY');

    if (!this.apiEndpoint || !this.apiKey) {
      throw new Error('Weather API configuration is missing');
    }

    this.axios = axios.create({
      baseURL: this.apiEndpoint,
      // 필요에 따라 요청 공통 헤더/타임아웃 등을 설정할 수 있습니다.
      // headers: { ... },
      // timeout: 3000,
    });
  }

  /**
   * getPresentWeather
   * - 초단기 실황조회(API) 등을 사용하여 현재 날씨를 불러오는 메서드
   * - 응답값에서 필요한 정보를 추출하여 WeatherForecast 형태로 반환
   */
  async getCurrentWeather(lon: number, lat: number): Promise<CurrentWeather> {
    try {
      // 1. 경도/위도를 기상청 격자 좌표로 변환 (예: convertLonLatToGrid 함수)
      const { nx, ny } = this.weatherGridConverter.convertLonLatToGrid(
        lon,
        lat,
      );

      // 2. 초단기 실황조회 API 호출
      // 예시: GET /getUltraSrtNcst?serviceKey=...&base_date=...&base_time=...&nx=..&ny=..&dataType=JSON
      // 실제 사용 시 날짜(base_date, base_time 등)를 적절히 계산하여 호출해야 합니다.
      const baseDate = this._getBaseDate(); // 예: YYYYMMDD
      const baseTime = this._getBaseTime(); // 예: HHmm
      const ultraSrtResponse = await this.axios.get(
        '/VilageFcstInfoService_2.0/getUltraSrtNcst',
        {
          params: {
            serviceKey: this.apiKey,
            base_date: baseDate,
            base_time: baseTime,
            nx,
            ny,
            dataType: 'JSON',
          },
        },
      );

      // 3. 응답 데이터 파싱
      // 기상청 응답 구조에 맞춰 필요한 요소를 찾아서 WeatherForecast 형태로 가공
      const currentData = ultraSrtResponse.data; // 실제 응답 구조에 따라 가공 필요
      // 아래는 "예시" 가공 로직입니다. 실제 필드명/로직을 꼭 확인하세요.
      const currentTemp = this._parseTemperature(currentData);
      const skyStatus = this._parseSkyStatus(currentData);

      //오늘 하루 중 최고 기온, 최저 기온

      const srtResponse = await this.axios.get(
        '/VilageFcstInfoService_2.0/getVilageFcst',
        {
          params: {
            serviceKey: this.apiKey,
            base_date: dayjs().subtract(1, 'day').format('YYYYMMDD'),
            base_time: '2300',
            numOfRows: 312,
            nx,
            ny,
            dataType: 'JSON',
          },
        },
      );

      const srtData = srtResponse.data;
      const todayMaxTemp = this._parseTodayMaxTemp(srtData);
      const todayMinTemp = this._parseTodayMinTemp(srtData);

      const result: CurrentWeather = {
        location: await this._getLocation(lon, lat),
        date: `${baseDate}${baseTime}`,
        temp: currentTemp,
        minTemp: todayMinTemp,
        maxTemp: todayMaxTemp,
        sky: skyStatus,
      };
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch present weather', error);
      throw error;
    }
  }

  private _parseTodayMaxTemp(rawData: any): number {
    const body = rawData?.response?.body;
    if (!body || body.totalCount === 0) return -999;

    const item = body.items.item;
    if (!item) return -999;
    const todayStr = dayjs().format('YYYYMMDD');
    return item.reduce((acc: number, data: any) => {
      if (data.category === 'TMP') {
        if (data.fcstDate === todayStr) {
          return Math.max(acc, Number(data.fcstValue));
        }
      }
      return acc;
    }, -999);
  }

  private _parseTodayMinTemp(rawData: any): number {
    const body = rawData?.response?.body;
    if (!body || body.totalCount === 0) return -999;

    const item = body.items.item;
    if (!item) return -999;
    const todayStr = dayjs().format('YYYYMMDD');
    return item.reduce((acc: number, data: any) => {
      if (data.category === 'TMP') {
        if (data.fcstDate === todayStr) {
          return Math.min(acc, Number(data.fcstValue));
        }
      }
      return acc;
    }, 999);
  }

  /**
   * (예시) 위·경도로부터 행정 구역(시/도, 시/군/구, 읍/면/동)을 문자열로 반환하는 메서드
   */
  private async _getLocation(lon: number, lat: number): Promise<string> {
    try {
      // 1) Kakao 로컬 API 호출
      const localService = this.localClientFactory.getClient(
        LocalClientType.KAKAO,
      );
      const addressResponse = await localService.coordToRegionCode(lon, lat);

      // 2) 응답에서 주소 정보 파싱
      const region = addressResponse?.documents?.[0];

      if (!region) {
        // 주소 정보가 없으면 디폴트값 또는 예외 처리
        return 'Unknown Location';
      }

      // 3) 필요한 깊이만큼 문자열로 조합
      //    (region_1depth_name = 시/도, region_2depth_name = 시/군/구, region_3depth_name = 읍/면/동)
      const region1 = region.region_1depth_name ?? '';
      const region2 = region.region_2depth_name ?? '';

      // 예시: '서울특별시 강남구 역삼1동' 형태로 반환
      return `${region1} ${region2}`.trim();
    } catch (error) {
      this.logger.error('Failed to get location', error);
      // 에러 시 로그를 남기고 기본값 반환
      return 'Unknown Location';
    }
  }

  /**
   * getShortTermForecast
   * - 원래는 동네예보(단기) API로 구현했지만,
   *   이번에는 '육상예보조회(getLandFcst)' 사양을 이용해 재구성한 예시
   * - [육상예보조회] API는 regId(예보구역코드)를 기준으로 조회
   *   → (lon, lat)를 이용해 regId를 찾는 로직이 필요할 수 있음
   */
  async getShortTermForecast(
    lon: number,
    lat: number,
  ): Promise<WeatherForecast[]> {
    try {
      // 1) (예시) lon, lat 로부터 regId 를 얻는 로직
      //    실제로는 DB 조회, 좌표 매핑, TownCities 테이블 등을 이용
      const regId = await this._findRegId(lon, lat);
      if (!regId) {
        throw new Error('Cannot find regId for given coordinates');
      }

      // 2) 육상예보조회 API 호출
      //    문서에서 제공한 엔드포인트: /VilageFcstMsgService/getLandFcst
      //    (예) http://apis.data.go.kr/1360000/VilageFcstMsgService/getLandFcst
      //    요청 파라미터: serviceKey, numOfRows, pageNo, dataType, regId 등
      const response = await this.axios.get(
        '/VilageFcstMsgService/getLandFcst',
        {
          params: {
            serviceKey: this.apiKey, // 필수: 공공데이터포털에서 발급받은 인증키
            numOfRows: 10, // 한 페이지 결과 수(필요에 따라 조정)
            pageNo: 1, // 페이지 번호
            dataType: 'JSON', // 응답 형식(XML/JSON) - 예시는 JSON
            regId: regId, // 예보구역코드
          },
        },
      );

      // 3) 응답 데이터(JSON or XML) 파싱
      //    getLandFcst API는 발표시각, 발효번호(numEf), 풍향/풍속, 날씨, 기온, 강수확률 등을 포함
      //    필요한 필드를 추출해서 WeatherForecast[] 형식으로 매핑
      const forecastList = this._parseLandFcst(response.data);

      return forecastList;
    } catch (error) {
      this.logger.error(
        'Failed to fetch short-term forecast via 육상예보조회',
        error,
      );
      throw error;
    }
  }

  /**
   * getMidTermForecast
   * - 중기 육상예보(getMidLandFcst)와 중기기온예보(getMidTa)를 각각 호출
   * - 발표시각(tmFc)이 06시이면 4일 후 ~ 10일 후, 18시이면 5일 후 ~ 10일 후 예보를 대상으로 데이터 구성
   * - WeatherForecast[] 형태로 리턴
   */
  async getMidTermForecast(
    lon: number,
    lat: number,
  ): Promise<WeatherForecast[]> {
    try {
      // 1. 중기예보에 필요한 regId를 lon/lat → regId로 변환
      //    (실제로는 지역/행정구역 코드 테이블을 이용하거나 DB 조회를 해야 합니다.)
      const midRegId = await this._findMidTermRegId(lon, lat);
      if (!midRegId) {
        throw new Error('Cannot find mid-term regId for given coordinates');
      }

      // 2. 발표 기준 시각(tmFc) 결정 (YYYYMMDD0600 또는 YYYYMMDD1800 등)
      const tmFc = this._getMidTermBaseDateTime();

      // 3. [중기육상예보조회] API 호출
      //    - http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst
      //      (※ 실제 baseURL 등은 생성자 this.axios 설정에 맞게 호출)
      const midLandResponse = await this.axios.get(
        '/MidFcstInfoService/getMidLandFcst',
        {
          params: {
            serviceKey: this.apiKey,
            numOfRows: 10,
            pageNo: 1,
            dataType: 'JSON',
            regId: midRegId,
            tmFc,
          },
        },
      );

      const regId = await this._findRegId(lon, lat);
      // 4. [중기기온예보조회] API 호출
      //    - http://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa
      const midTaResponse = await this.axios.get(
        '/MidFcstInfoService/getMidTa',
        {
          params: {
            serviceKey: this.apiKey,
            numOfRows: 10,
            pageNo: 1,
            dataType: 'JSON',
            regId,
            tmFc,
          },
        },
      );

      // 5. 두 응답을 각각 파싱
      const landForecastList = this._parseMidTermLand(
        midLandResponse.data,
        tmFc,
      );
      const taForecastList = this._parseMidTermTa(midTaResponse.data, tmFc);

      // 6. 날짜별로 land 예보 + ta 예보를 합쳐서 WeatherForecast[] 형태로 구성
      //    여기서는 day4 ~ day10(또는 day5 ~ day10)의 인덱스를 맞춰 사용하므로
      //    서로 같은 'dayX' 번째에 해당하는 데이터를 매칭한다는 가정으로 처리합니다.
      //    (예: day4Am/pm, day5Am/pm ... day10)
      const mergedForecasts: WeatherForecast[] = [];

      // landForecastList, taForecastList를 '예측일자' 또는 'dayOffset' 등에 맞춰 매핑
      for (let i = 0; i < landForecastList.length; i++) {
        const landFc = landForecastList[i];
        const taFc = taForecastList[i];

        mergedForecasts.push({
          date: landFc.date, // 예: YYYY-MM-DD
          minTemp: taFc?.minTemp ?? -999,
          maxTemp: taFc?.maxTemp ?? -999,
          amSky: landFc.amSky,
          pmSky: landFc.pmSky,
        });
      }

      return mergedForecasts;
    } catch (error) {
      this.logger.error('Failed to fetch mid-term forecast', error);
      throw error;
    }
  }

  /**
   * 중기 육상예보(getMidLandFcst) 응답 데이터를 파싱
   * - (06시 기준) 4일 후 ~ 10일 후 / (18시 기준) 5일 후 ~ 10일 후
   * - 오전/오후 강수확률, 날씨 필드를 WeatherForecast 형태로 정리
   */
  private _parseMidTermLand(rawData: any, tmFc: string): WeatherForecast[] {
    // 응답 구조: rawData.response.body.items.item[0] 내에
    // rnSt4Am, rnSt4Pm, wf4Am, wf4Pm, ..., rnSt10, wf10 등이 들어 있음.
    const body = rawData?.response?.body;
    if (!body || body.totalCount === 0) return [];

    // 보통 중기예보는 1건(item[0])에 모든 정보가 들어옴
    const item = body.items.item[0];
    if (!item) return [];

    // 발표시각(YYYYMMDDHHmm)에서 'HH'를 확인
    // ex) tmFc = '202301190600' → HH = '06'
    const hourStr = tmFc.slice(-4, -2);

    // 06이면 4~10, 18이면 5~10
    const startDay = hourStr === '06' ? 4 : 5;
    const endDay = 10;

    const result: WeatherForecast[] = [];

    // tmFc 기준 날짜에 dayOffset(4~10일)을 더해 최종 date(YYYY-MM-DD) 계산
    // 실제로는 dayjs 등을 사용해서 날짜 연산을 해주는 것이 안전함
    const baseDateStr = tmFc.slice(0, 8); // YYYYMMDD
    const baseDate = dayjs(baseDateStr, 'YYYYMMDD');

    for (let d = startDay; d <= endDay; d++) {
      // dayX에 해당하는 예측 날짜
      const forecastDate = baseDate.add(d, 'day').format('YYYY-MM-DD');

      if (d <= 7) {
        // 오전/오후 필드가 분리
        const wfAm = item[`wf${d}Am`];
        const wfPm = item[`wf${d}Pm`];

        result.push({
          date: forecastDate,
          minTemp: -999, // 여기서는 기온 미포함
          maxTemp: -999,
          amSky: wfAm,
          pmSky: wfPm,
        });
      } else {
        const wf = item[`wf${d}`];

        result.push({
          date: forecastDate,
          minTemp: -999,
          maxTemp: -999,
          amSky: wf,
          pmSky: wf,
        });
      }
    }

    return result;
  }

  /**
   * 중기 기온예보(getMidTa) 응답 데이터 파싱
   * - (06시) 4~10일, (18시) 5~10일 분에 대해서만 최저/최고 기온 추출
   */
  private _parseMidTermTa(rawData: any, tmFc: string): WeatherForecast[] {
    const body = rawData?.response?.body;
    if (!body || body.totalCount === 0) return [];

    const item = body.items.item[0];
    if (!item) return [];

    const hourStr = tmFc.slice(-4, -2);
    const startDay = hourStr === '06' ? 4 : 5;
    const endDay = 10;

    // tmFc 기준 날짜
    const baseDateStr = tmFc.slice(0, 8);
    const baseDate = dayjs(baseDateStr, 'YYYYMMDD');

    const result: WeatherForecast[] = [];

    for (let d = startDay; d <= endDay; d++) {
      // 예: taMin4, taMax4 ~ taMin10, taMax10
      const minTempField = `taMin${d}`;
      const maxTempField = `taMax${d}`;

      const forecastDate = baseDate.add(d, 'day').format('YYYY-MM-DD');

      result.push({
        date: forecastDate,
        minTemp: Number(item[minTempField]),
        maxTemp: Number(item[maxTempField]),
        amSky: '',
        pmSky: '',
      });
    }

    return result;
  }

  // ----------------------------------------------------------
  // 아래 부분들은 예시로 작성된 함수들로, 실제 API 사용 시
  // 꼭 필요한 계산 로직, 응답 파싱, 시간 계산 등을 구현해야 합니다.
  // ----------------------------------------------------------

  /**
   * 초단기/단기예보용 baseDate/baseTime 계산
   * 보통 현재 시각에서 API가 요구하는 시간 단위(1시간, 3시간 등)로 정리
   */
  private _getBaseDate(): string {
    // 예시: 오늘 날짜를 YYYYMMDD 형태로
    return dayjs().format('YYYYMMDD');
  }

  private _getBaseTime(): string {
    // 예시: 현재 시각 기준으로 초단기 실황 base_time = 정시 전후로 조정
    // 실제로는 기상청 API 가이드에 따라 적절히 처리 필요
    return dayjs().subtract(11, 'minutes').format('HH00');
  }

  /**
   * (예시) lon, lat -> regId 매핑
   * - 실제로는 DB 조회나 지역 테이블 매핑
   * - 일단 샘플 값 리턴
   */
  private async _findRegId(lon: number, lat: number): Promise<string> {
    const localService = this.localClientFactory.getClient(
      LocalClientType.KAKAO,
    );

    const address = await localService.coordToAddress(lon, lat);

    const region = address?.documents?.[0];

    if (!region) {
      return '11A00101';
    }

    if (region.address.region_1depth_name.startsWith('광주')) {
      return '21F20801';
    }

    // start with region_1depth_name
    const metroCity = await this.townCitiesRepository.findOne({
      where: {
        name: Like(`${region.address.region_1depth_name}%`),
      },
    });

    if (metroCity) {
      return metroCity.regId;
    }

    if (region.address.region_2depth_name.startsWith('광주')) {
      return '11B20702';
    }
    if (region.address.region_2depth_name.startsWith('고성')) {
      if (region.address.region_1depth_name.startsWith('강원')) {
        return '11D20402';
      }
      return '11H20404';
    }
    const townCity = await this.townCitiesRepository.findOne({
      where: {
        name: Like(`${region.address.region_2depth_name.split(' ')[0]}%`),
      },
    });

    if (townCity) {
      return townCity.regId;
    }

    return '11A00101';
  }

  /**
   * 발표 시각(announceTime) + numEf를 바탕으로
   * 해당 예보가 "어느 날짜의 오전/오후" 예보인지 계산하는 로직
   */
  private _getForecastDateAndHalfDay(
    announceTime: number,
    numEf: number,
  ): { dateStr: string; isMorning: boolean } {
    const announceTimeDayjs = dayjs(announceTime + '', 'YYYYMMDDHHmm');
    // 1) 발표 시각 파싱
    const hourStr = announceTimeDayjs.format('HH');
    const hour = Number(hourStr);

    // 2) "발표시간 기준"에 따라, numEf=0 일 때가 '오늘오전' 혹은 '오늘오후' 인지 결정
    //    질문에서 주어진 기준표를 그대로 코드에 매핑 (간단화 예시)
    //    - 17시~익일5시 이전
    //    - 5시~11시 이전
    //    - 11시~17시 이전
    //    각각 numEf 0,1,2,...에 따른 (며칠 뒤, 오전/오후) 매핑

    // 우선, 시간대 분류
    let timeRange: '17to5' | '5to11' | '11to17';
    if (hour >= 17 || hour < 5) {
      timeRange = '17to5';
    } else if (hour >= 5 && hour < 11) {
      timeRange = '5to11';
    } else {
      timeRange = '11to17';
    }

    // numEf -> [dateOffset, isMorning] 정보를 담은 테이블(예시)
    // 질문에 있는 표를 그대로 코드화한 것이므로 필요에 따라 수정 가능
    const table_17to5 = [
      /* 0: 오늘오후 */ [0, false],
      /* 1: 내일오전 */ [1, true],
      /* 2: 내일오후 */ [1, false],
      /* 3: 모레오전 */ [2, true],
      /* 4: 모레오후 */ [2, false],
      /* 5: 글피오전 */ [3, true],
      /* 6: 글피오후 */ [3, false],
      /* 7: 그글피오전 */ [4, true],
      /* 8: 그글피오후 */ [4, false],
    ];
    const table_5to11 = [
      /* 0: 오늘오전 */ [0, true],
      /* 1: 오늘오후 */ [0, false],
      /* 2: 내일오전 */ [1, true],
      /* 3: 내일오후 */ [1, false],
      /* 4: 모레오전 */ [2, true],
      /* 5: 모레오후 */ [2, false],
      /* 6: 글피오전 */ [3, true],
      /* 7: 글피오후 */ [3, false],
      /* 8: 그글피오전 */ [4, true],
      /* 9: 그글피오후 */ [4, false],
    ];
    const table_11to17 = [
      /* 0: 오늘오후 */ [0, false],
      /* 1: 내일오전 */ [1, true],
      /* 2: 내일오후 */ [1, false],
      /* 3: 모레오전 */ [2, true],
      /* 4: 모레오후 */ [2, false],
      /* 5: 글피오전 */ [3, true],
      /* 6: 글피오후 */ [3, false],
    ];

    // 위 테이블 중 현재 timeRange에 맞는 것 선택
    let dateOffset = 0;
    let isMorning = false;

    if (timeRange === '17to5' && numEf < table_17to5.length) {
      dateOffset = table_17to5[numEf][0] as number;
      isMorning = table_17to5[numEf][1] as boolean;
    } else if (timeRange === '5to11' && numEf < table_5to11.length) {
      dateOffset = table_5to11[numEf][0] as number;
      isMorning = table_5to11[numEf][1] as boolean;
    } else if (timeRange === '11to17' && numEf < table_11to17.length) {
      dateOffset = table_11to17[numEf][0] as number;
      isMorning = table_11to17[numEf][1] as boolean;
    } else {
      // 혹은 에러 처리, 혹은 기본값
      // console.warn("numEf가 범위를 벗어났습니다.", numEf);
    }

    // 발표 시각 + dateOffset 일 후를 계산
    const forecastDate = announceTimeDayjs.add(dateOffset, 'day');
    const dateStr = forecastDate.format('YYYY-MM-DD');

    return { dateStr, isMorning };
  }

  /**
   * 육상 예보 응답(JSON) 파싱 후, 오전/오후(최저/최고기온)로 묶어서 WeatherForecast[] 형태로 반환
   */
  private _parseLandFcst(rawData: any): WeatherForecast[] {
    // 1) JSON 구조 확인
    const items: any = rawData?.response?.body?.items?.item || [];

    // 날짜별(YYYY-MM-DD) 저장용 (am/pm 나누어 담을 것이므로 오브젝트 형태)
    // 키: 'YYYY-MM-DD', 값: { date, minTemp, maxTemp, amSky, pmSky }
    const forecastMap: Record<string, WeatherForecast> = {};

    for (const item of items) {
      const announceTime = item.announceTime; // YYYYMMDDHHmm
      const numEf = Number(item.numEf);

      // 발표시각 + numEf를 바탕으로 최종 예보 날짜와 오전/오후 여부 계산
      const { dateStr, isMorning } = this._getForecastDateAndHalfDay(
        announceTime,
        numEf,
      );

      // 해당 날짜에 대한 Forecast 객체가 없으면 새로 만들기
      if (!forecastMap[dateStr]) {
        forecastMap[dateStr] = {
          date: dateStr,
          minTemp: -999,
          maxTemp: -999,
          amSky: '',
          pmSky: '',
        };
      }

      const fc = forecastMap[dateStr];
      const tempValue = Number(item.ta);
      const skyValue = item.wf ?? '';

      // 오전이면 최저온도(minTemp), 오후이면 최고온도(maxTemp)에 매핑
      if (isMorning) {
        fc.minTemp = tempValue;
        fc.amSky = skyValue;
      } else {
        fc.maxTemp = tempValue;
        fc.pmSky = skyValue;
      }
    }

    // forecastMap에 쌓인 객체들을 배열로 변환
    const result: WeatherForecast[] = Object.values(forecastMap);

    // 필요하다면 날짜 오름차순 정렬 등 추가 처리
    // result.sort((a, b) => (a.date > b.date ? 1 : -1));

    return result;
  }

  /**
   * 중기예보 API 호출 시 사용하는 기준 시간 계산
   * 예: 6시, 18시 기준
   */
  private _getMidTermBaseDateTime(): string {
    // 현재 시각을 기준으로 06시 또는 18시를 결정하여 YYYYMMDDHHmm 형태로 반환
    const now = dayjs().subtract(50, 'minutes'); // 1시간 전으로 설정
    const hour = now.hour();
    // 6시 이전이면 전날 18시, 6시부터 18시 이전이면 오늘 06시, 그 이후면 오늘 18시
    let base;
    if (hour < 6) {
      base = now.subtract(1, 'day').hour(18).minute(0);
    } else if (hour < 18) {
      base = now.hour(6).minute(0);
    } else {
      base = now.hour(18).minute(0);
    }

    return base.format('YYYYMMDDHHmm');
  }

  /**
   * 예시: 중기예보 regId 찾기
   * - 중기예보는 지역 코드로 조회해야 하므로, DB나 다른 로직을 통해 lon/lat -> regId 매핑
   */
  /**
   * 예시: 중기예보 regId 찾기
   * - 중기예보는 지역 코드로 조회해야 하므로, DB나 다른 로직을 통해 lon/lat -> midRegId 매핑
   */
  private async _findMidTermRegId(lon: number, lat: number): Promise<string> {
    // 지역정보 조회를 위해 KAKAO 로컬 서비스 사용
    const localService = this.localClientFactory.getClient(
      LocalClientType.KAKAO,
    );
    const address = await localService.coordToAddress(lon, lat);
    const region = address?.documents?.[0];

    if (!region) {
      // 기본값 설정 (필요에 따라 조정)
      return '11B00000';
    }

    // 예시: 특정 지역에 대한 midRegId 반환 로직
    if (region.address.region_1depth_name.startsWith('광주')) {
      return '11F20000'; // 예시 코드
    }

    const metroCity = await this.townCitiesRepository.findOne({
      where: {
        name: Like(`${region.address.region_1depth_name}%`),
      },
    });

    if (metroCity) {
      return metroCity.midRegId;
    }

    if (region.address.region_2depth_name.startsWith('광주')) {
      return '11B00000';
    }
    if (region.address.region_2depth_name.startsWith('고성')) {
      if (region.address.region_1depth_name.startsWith('강원')) {
        return '11D20000';
      }
      return '11H20000';
    }

    // 데이터베이스에서 중기 예보용 regId 조회
    const townCity = await this.townCitiesRepository.findOne({
      where: {
        name: Like(`${region.address.region_2depth_name.split(' ')[0]}%`),
      },
    });

    if (townCity) {
      // DB에 저장된 regId가 중기예보에 사용 가능한 코드라면 반환
      return townCity.midRegId;
    }

    // 기타 지역 기본 처리
    return '11B00000';
  }

  /**
   * 응답 데이터를 파싱하여 현재 기온을 뽑아오는 예시
   * 실제 응답 구조를 확인하고 키를 맞춰야 합니다.
   */
  private _parseTemperature(data: any): number {
    // response.data -> JSON 구조 속에서 기온 카테고리를 찾아 리턴
    // T1H	기온	℃	10
    // RN1	1시간 강수량	mm	8
    // UUU	동서바람성분	m/s	12
    // VVV	남북바람성분	m/s	12
    // REH	습도	%	8
    // PTY	강수형태	코드값	4
    // VEC	풍향	deg	10
    // WSD	풍속	m/s	10
    return parseFloat(
      data?.response?.body?.items.item.find(
        (content: any) => content.category === 'T1H',
      ).obsrValue || '-999',
    );
  }

  /**
   * 응답 데이터를 파싱하여 하늘 상태(맑음/구름 등)를 뽑아오는 예시
   */
  private _parseSkyStatus(data: any): string {
    // 하늘상태 코드 혹은 텍스트를 찾아서 리턴
    // 강수형태(PTY) 코드 : (초단기) 없음(0), 비(1), 비/눈(2), 눈(3), 빗방울(5), 빗방울눈날림(6), 눈날림(7)
    const codeToText = [
      '맑음/흐림',
      '비',
      '비/눈',
      '눈',
      '빗방울',
      '빗방울눈날림',
      '눈날림',
    ];
    return codeToText[
      data?.response?.body?.items.item.find(
        (content: any) => content.category === 'PTY',
      ).obsrValue || 0
    ];
  }
}
