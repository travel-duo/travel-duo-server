// 중기예보 지역 코드
export const MidTermForecastRegion = {
  SEOUL: '11B10101',
  BUSAN: '11H20201',
} as const;

// 단기예보 좌표
export const LocationCoordinates = {
  SEOUL: { nx: 60, ny: 127 },
  BUSAN: { nx: 98, ny: 76 },
} as const;
