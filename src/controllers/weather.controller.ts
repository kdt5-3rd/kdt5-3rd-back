import { Request, Response, NextFunction } from "express";
import { weatherService } from "../services/weather.service";
import { airQualityService } from "../services/airQuality.service";

export const weatherController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const latParam = req.query.lat as string;
    const lonParam = req.query.lon as string;
    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      res.status(400).json({
        success: false,
        message: "정확한 위도와 경도를 모두 입력해주세요.",
      });
      return;
    }

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
    });
  } catch (error) {
    next(error);
  }
};
