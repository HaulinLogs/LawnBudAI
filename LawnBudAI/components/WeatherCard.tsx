import {
  getCurrentWeatherIcon,
  getWeatherIcon,
  getRainForecast,
  WeatherDay,
  WeatherResponse,
} from '@/models/weather';
import { createAppStyles } from '@/styles/app.styles';
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = { weather: WeatherResponse };

function celsiusToFahrenheit(celsius: string): number {
  return Math.round((parseFloat(celsius) * 9 / 5) + 32);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function WeatherCardComponent({ weather }: Props) {
  const themeColors = useAppTheme();
  const styles = useMemo(() => createAppStyles(themeColors), [themeColors]);
  const forecastStyles = useMemo(() => StyleSheet.create({
    forecastContainer: {
      marginTop: 12,
    },
    forecastScroll: {
      gap: 8,
    },
    forecastCard: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: 8,
      padding: 12,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    forecastDate: {
      fontSize: 12,
      fontWeight: '600',
      color: themeColors.forecastDate,
    },
    forecastTemp: {
      fontSize: 14,
      fontWeight: '500',
      color: themeColors.forecastTemp,
    },
    forecastTempSmall: {
      fontSize: 12,
      color: themeColors.forecastTempSmall,
    },
    forecastIcon: {
      color: '#22c55e',
    },
  }), [themeColors]);

  return (
    <>
      <Text style={styles.sectionTitle}>Today&apos;s Weather</Text>
      <View style={styles.weatherRow}>
        <Text style={styles.weatherText}>
          {weather?.current_condition[0]?.weatherDesc[0]?.value} · {weather?.current_condition[0].temp_F}°F · {getRainForecast(weather?.weather)}
        </Text>
        <View style={styles.iconContainer}>
          <Icon
            name={getCurrentWeatherIcon(weather)}
            size={48}
            style={styles.weatherIcon}
          />
        </View>
      </View>

      <View style={forecastStyles.forecastContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={forecastStyles.forecastScroll}
        >
          {weather.weather.map((day: WeatherDay) => {
            const maxTempF = celsiusToFahrenheit(day.maxtempC);
            const minTempF = celsiusToFahrenheit(day.mintempC);
            const weatherIcon = day.hourly[0]?.weatherCode || '113';

            return (
              <View key={day.date} style={forecastStyles.forecastCard}>
                <Text style={forecastStyles.forecastDate}>
                  {formatDate(day.date)}
                </Text>
                <Icon
                  name={getWeatherIcon(weatherIcon)}
                  size={32}
                  style={forecastStyles.forecastIcon}
                />
                <View>
                  <Text style={forecastStyles.forecastTemp}>
                    {maxTempF}°
                  </Text>
                  <Text style={forecastStyles.forecastTempSmall}>
                    {minTempF}°
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

export const WeatherCard = React.memo(WeatherCardComponent);
