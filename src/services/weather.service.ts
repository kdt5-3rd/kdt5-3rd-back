import axios from "axios";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

export interface WeatherLocation {
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherCurrent {
  time: string;
  temperature: number;
  weathercode: number;
  humidity: number;
  windspeed: number;
  pressure: number;
  uv_index: number;
}

export interface WeatherHourly {
  time: string;
  temperature: number;
  precipitation: number;
  weathercode: number;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: WeatherCurrent;
  hourly: WeatherHourly[];
}

function formatLocalHour(date: Date): string {
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  return `${Y}-${M}-${D}T${h}:00`;
}

export const weatherService = async (
  latitude: number,
  longitude: number
): Promise<WeatherResponse> => {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const currentHour = formatLocalHour(now);

    const url = "https://api.open-meteo.com/v1/forecast";
    const params = {
      latitude,
      longitude,
      current_weather: true,
      hourly:
        "temperature_2m,precipitation,weathercode,relativehumidity_2m,pressure_msl,uv_index",
      timezone: "Asia/Seoul",
    };

    const { data } = await axios.get(url, {
      params,
      timeout: 5000,
    });

    const {
      latitude: lat,
      longitude: lon,
      timezone,
      current_weather,
      hourly,
    } = data;

    const startIdx = hourly.time.findIndex((t: string) => t === currentHour);
    if (startIdx === -1) {
      const { status, body } = errorResponse(
        ERROR_CODES.NOT_FOUND,
        "현재 시각에 해당하는 hourly 날씨 데이터가 없습니다."
      );
      throw { ...body, status };
    }

    const hourlyData: WeatherHourly[] = hourly.time
      .slice(startIdx, startIdx + 24)
      .map((time: string, i: number) => ({
        time,
        temperature: hourly.temperature_2m[startIdx + i],
        precipitation: hourly.precipitation[startIdx + i],
        weathercode: hourly.weathercode[startIdx + i],
      }));

    const current: WeatherCurrent = {
      time: current_weather.time,
      temperature: current_weather.temperature,
      weathercode: current_weather.weathercode,
      humidity: hourly.relativehumidity_2m[startIdx],
      windspeed: current_weather.windspeed,
      pressure: hourly.pressure_msl[startIdx],
      uv_index: hourly.uv_index[startIdx],
    };

    const location: WeatherLocation = { latitude, longitude, timezone };
    return { location, current, hourly: hourlyData };
  } catch (err: any) {
    if (err.status && err.code) {
      throw err;
    }
    const { status, body } = errorResponse(
      ERROR_CODES.INTERNAL,
      "날씨 데이터를 가져오는 중 오류가 발생했습니다.",
      { originalError: err.message }
    );
    throw { ...body, status };
  }
};
