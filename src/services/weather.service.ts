import axios from 'axios';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';

export const getWeatherData = async (lat: string, lng: string) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon: lng,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    });

    const data = response.data;

    return {
      location: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
    };
  } catch (err) {
    const { status, body } = errorResponse(
      ERROR_CODES.EXTERNAL_API_ERROR,
      '날씨 데이터를 가져오는 데 실패했습니다.'
    );
    throw { ...body, status };
  }
};
