export interface WeatherForecast {
  date: string;
  temperature: number;
  humidity: number;
}

export interface WeatherClient {
  getShortTermForecast(nx: number, ny: number, baseDate: string, baseTime: string): Promise<WeatherForecast[]>;
  getTodayForecast(nx: number, ny: number): Promise<WeatherForecast[]>;
}