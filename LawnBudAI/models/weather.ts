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

// Return Ionicon icon codes
export function getWeatherIcon(weatherCode: string): string {
  switch (weatherCode) {
        // rainy-outline
        // thunderstorm-outline
        // partly-sunny-outline
        // sunny-outline
        // snow-outline
    case "113": return "sunny-outline";
    case "116": return "partly-sunny-outline";
    case "119": return "cloudy-outline";
    case "122": return "cloudy-outline";
    case "143": return "weather-fog";
    case "176": return "cloud-drizzle";
    case "179": return "cloud-drizzle";
    case "182": return "cloud-drizzle";
    case "185": return "cloud-drizzle";
    case "200": return "thunderstorm-outline";
    case "227": return "snowflake";
    case "230": return "snowflake-alert";
    case "248": return "weather-fog";
    case "260": return "weather-fog";
    case "263": return "cloud-drizzle";
    case "266": return "cloud-drizzle";
    case "283": return "cloud-drizzle";
    case "286": return "cloud-drizzle";
    case "293": return "cloud-drizzle";
    case "296": return "cloud-drizzle";
    case "299": return "cloud-rain";
    case "302": return "cloud-rain";
    case "305": return "cloud-rain";
    case "308": return "cloud-rain";
    case "311": return "cloud-drizzle";
    case "314": return "cloud-drizzle";
    case "317": return "cloud-drizzle";
    case "320": return "cloud-snow";
    case "323": return "cloud-snow";
    case "326": return "cloud-snow";
    case "329": return "snowflake-alert";
    case "332": return "snowflake-alert";
    case "335": return "snowflake-alert";
    case "338": return "snowflake-alert";
    case "350": return "cloud-drizzle";
    case "353": return "cloud-drizzle";
    case "356": return "cloud-rain";
    case "359": return "snowflake-alert";
    case "362": return "cloud-drizzle";
    case "365": return "cloud-drizzle";
    case "368": return "cloud-snow";
    case "371": return "snowflake-alert";
    case "374": return "cloud-drizzle";
    case "377": return "cloud-drizzle";
    case "386": return "thunderstorm-outline";
    case "389": return "thunderstorm-outline";
    case "392": return "thunderstorm-outline";
    case "395": return "snowflake-alert";
    case "398": return "snowflake-alert";
  }
  return "sunny-outline";
}
function isRainCode(weatherCode: string): boolean {
  let icon = getWeatherIcon(weatherCode);
  switch (icon) {
    case "cloud-drizzle":
    case "cloud-rain":
    case "cloud-snow":
    case "thunderstorm-outline":
      return true;
    default:
      return false;
  }
}

function getTimeString(time: string): string
{
  let date = new Date(time);
  return date.toLocaleTimeString();
}

export function getRainForecast(weatherDays: WeatherDay[]): string
{
  let rain = "No rain expected";
  for (let i = 0; i < weatherDays.length; i++) {
    for (let j = 0; j < weatherDays[i].hourly.length; j++) {
      if (isRainCode(weatherDays[i].hourly[j].weatherCode)) {
        rain = "Rain expected at " + getTimeString(weatherDays[i].hourly[j].time);
        break;
      }
    }
  }
  return rain;
}