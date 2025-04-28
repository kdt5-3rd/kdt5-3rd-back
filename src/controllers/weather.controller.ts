import { Request, Response, NextFunction } from "express";
import {
  weatherService,
  WeatherLocation,
  WeatherCurrent,
  WeatherHourly,
  WeatherDaily,
} from "../services/weather.service";
import {
  airQualityService,
  AirQualityCurrent,
} from "../services/airQuality.service";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

interface WeatherRequestQuery {
  lat: string;
  lon: string;
}
interface WeatherResponseBody {
  success: true;
  location: WeatherLocation;
  current: WeatherCurrent & AirQualityCurrent;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
}

export const weatherController = async (
  req: Request<{}, {}, {}, WeatherRequestQuery>,
  res: Response<WeatherResponseBody>,
  next: NextFunction
): Promise<void> => {
  const { lat: latParam, lon: lonParam } = req.query;
  const lat = parseFloat(latParam);
  const lon = parseFloat(lonParam);

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    const { status, body } = errorResponse(
      ERROR_CODES.BAD_REQUEST,
      "정확한 위도(lat)와 경도(lon)를 모두 입력해주세요."
    );
    return next({ ...body, status });
  }

  try {
    const weatherData = await weatherService(lat, lon);
    const airQualityData = await airQualityService(lat, lon);

    const currentWithAirQuality = {
      ...weatherData.current,
      pm10: airQualityData.current.pm10,
      pm2_5: airQualityData.current.pm2_5,
    };

    res.status(200).json({
      success: true,
      location: weatherData.location,
      current: currentWithAirQuality,
      hourly: weatherData.hourly,
      daily: weatherData.daily,
    });
  } catch (err) {
    next(err);
  }
};
