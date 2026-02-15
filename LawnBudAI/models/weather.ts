import Icon from '@expo/vector-icons/Ionicons';
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
  tempF: string;
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

export function getCurrentWeatherIcon(weather: WeatherResponse) {
  return getWeatherIcon(weather.current_condition[0].weatherCode);
}

// Return Ionicon icon codes
export function getWeatherIcon(weatherCode: string): React.ComponentProps<typeof Icon>['name'] {
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
    case "143": return "partly-sunny";
    case "176": return "rainy";
    case "179": return "rainy";
    case "182": return "rainy";
    case "185": return "rainy";
    case "200": return "thunderstorm-outline";
    case "227": return "snow";
    case "230": return "snow";
    case "248": return "partly-sunny";
    case "260": return "partly-sunny";
    case "263": return "rainy";
    case "266": return "rainy";
    case "283": return "rainy";
    case "286": return "rainy";
    case "293": return "rainy";
    case "296": return "rainy";
    case "299": return "rainy";
    case "302": return "rainy";
    case "305": return "rainy";
    case "308": return "rainy";
    case "311": return "rainy";
    case "314": return "rainy";
    case "317": return "rainy";
    case "320": return "snow";
    case "323": return "snow";
    case "326": return "snow";
    case "329": return "snow";
    case "332": return "snow";
    case "335": return "snow";
    case "338": return "snow";
    case "350": return "rainy";
    case "353": return "rainy";
    case "356": return "rainy";
    case "359": return "snow";
    case "362": return "rainy";
    case "365": return "rainy";
    case "368": return "snow";
    case "371": return "snow";
    case "374": return "rainy";
    case "377": return "rainy";
    case "386": return "thunderstorm-outline";
    case "389": return "thunderstorm-outline";
    case "392": return "thunderstorm-outline";
    case "395": return "snow";
    case "398": return "snow";
  }
  return "sunny-outline";
}
function isRainCode(weatherCode: string): boolean {
  let icon = getWeatherIcon(weatherCode);
  switch (icon) {
    case "rainy":
    case "snow":
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