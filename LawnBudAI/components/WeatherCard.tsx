import { getCurrentWeatherIcon, getWeatherIcon, getRainForecast, WeatherDay, WeatherResponse } from '@/models/weather';
import { styles } from '@/styles/app.styles';
import React from 'react';
import { View, Text } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

type Props = {weather: WeatherResponse }

export function WeatherCard({weather}: Props) {
  function formatTime(time: string): string {
    return time;
  }

  function getHourlyText(day: WeatherDay) {
    return day.hourly.map(h => {
      let id = `${day.date}${h.time}`;
      
      return (
        <Text key={id}>
          {formatTime(h.time)} {h.tempF}
          {'\u00B0'}F{" "}
          <Icon
            name={getWeatherIcon(h.weatherCode)}
            size={14} // increase the base size
            style={styles.weatherIcon}
          />
        </Text>
      );
    });
  }
  return (
    <>
    <Text style={styles.sectionTitle}>Today’s Weather</Text>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherText}>
          {weather?.current_condition[0]?.weatherDesc[0]?.value} ·{" "}
          {weather?.current_condition[0].temp_F}°F ·{" "}
          {getRainForecast(weather?.weather)}
        </Text>
        <View style={styles.iconContainer}>
          <Icon
            name={getCurrentWeatherIcon(weather)}
            size={48} // increase the base size
            style={styles.weatherIcon}
          />
        </View>
      </View>
       {weather.weather.map(w => (
            <Text key={w.date}>
              <b>{w.date}</b>{" "}
              {getHourlyText(w)}
            </Text>))}
    </>
  )
}