import { Injectable } from '@nestjs/common';

@Injectable()
export class WeatherGridConverter {
  private static readonly RE = 6371.00877; // 지구 반경(km)
  private static readonly GRID = 5.0; // 격자 간격(km)
  private static readonly SLAT1 = 30.0; // 투영 위도1(degree)
  private static readonly SLAT2 = 60.0; // 투영 위도2(degree)
  private static readonly OLON = 126.0; // 기준점 경도(degree)
  private static readonly OLAT = 38.0; // 기준점 위도(degree)
  private static readonly XO = 43; // 기준점 X좌표(GRID)
  private static readonly YO = 136; // 기준점 Y좌표(GRID)

  private static readonly DEGRAD = Math.PI / 180.0;
  private static readonly RADDEG = 180.0 / Math.PI;

  /**
   * 위도, 경도를 받아 기상청 격자 좌표로 변환
   * @param lon 경도 (Longitude)
   * @param lat 위도 (Latitude)
   * @returns 변환된 격자 좌표 { nx, ny }
   */
  public convertLonLatToGrid(
    lon: number,
    lat: number,
  ): { nx: number; ny: number } {
    const { RE, GRID, SLAT1, SLAT2, OLON, OLAT, XO, YO, DEGRAD } =
      WeatherGridConverter;

    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn =
      Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
      Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);

    // 변환: 위경도 -> 격자 좌표
    const ra_temp = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
    const ra = (re * sf) / Math.pow(ra_temp, sn);

    let theta = lon * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

    return { nx: x, ny: y };
  }
}

// 사용 예:
const converter = new WeatherGridConverter();
const gridCoords = converter.convertLonLatToGrid(127, 60);
console.log(gridCoords.nx, gridCoords.ny);
