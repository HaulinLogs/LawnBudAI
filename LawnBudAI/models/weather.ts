export interface ValueWrapper {
  value: string;
}

export interface CurrentCondition {
  temp_C: string;
  temp_F: string;
  FeelsLikeC: string;
  FeelsLikeF: string;
  humidity: string;
  weatherCode: string;
  weatherDesc: ValueWrapper[];
  weatherIconUrl: ValueWrapper[];
}

export interface HourlyForecast {
  time: string;
  tempC: string;
  FeelsLikeC: string;
  weatherCode: string;
  weatherDesc: ValueWrapper[];
  weatherIconUrl: ValueWrapper[];
}

export interface WeatherDay {
  date: string;
  maxtempC: string;
  mintempC: string;
  hourly: HourlyForecast[];
}

export interface NearestArea {
  areaName: ValueWrapper[];
  region: ValueWrapper[];
  country: ValueWrapper[];
}

export interface WeatherResponse {
  current_condition: CurrentCondition[];
  weather: WeatherDay[];
  nearest_area: NearestArea[];
}
