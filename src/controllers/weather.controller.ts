import { Request, Response, NextFunction } from 'express';
import { getWeatherData } from '../services/weather.service';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';

export const getWeatherController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      const { status, body } = errorResponse(
        ERROR_CODES.INVALID_PARAM,
        '위도와 경도 값이 필요합니다.',
        { fields: ['lat', 'lng'] }
      );
      throw { ...body, status };
    }

    const weather = await getWeatherData(lat.toString(), lng.toString());

    res.status(200).json({
      success: true,
      message: '날씨 정보 조회 성공',
      data: weather,
    });
  } catch (err) {
    next(err);
  }
};
