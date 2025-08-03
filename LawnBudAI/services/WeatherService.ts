import axios from 'axios';

export async function getWeather(city: string): Promise<string> {
  // Replace this with a real API like OpenWeatherMap
  const response = await axios.get(`https://wttr.in/${city}?format=%C`);
  return response.data;
}