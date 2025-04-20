import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/errorResponse';
import { ERROR_CODES } from '../../constants/errorCodes';
import { isValidDateTime } from '../../utils/validate/isValidDateTime';

/**
 * 📌 일정 생성/수정 요청의 body 유효성 검사 미들웨어
 * - 필수: title (string), start_time (ISO datetime)
 * - 선택: memo, end_time, address, place_name (string), latitude, longitude (number)
 */
export const validateTaskBody = (req: Request, res: Response, next: NextFunction) => {
  const {
    title,
    memo,
    start_time,
    end_time,
    address,
    place_name,
    latitude,
    longitude,
  } = req.body;

  // 🔸 필수값: title
  if (typeof title !== 'string' || title.trim() === '') {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      '일정 제목(title)은 필수이며 문자열이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // 🔸 필수값: start_time (ISO 날짜시간 문자열)
  if (typeof start_time !== 'string' || !isValidDateTime(start_time)) {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      'start_time은 ISO 8601 형식의 문자열이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // 🔸 선택값: end_time (있다면 유효한 날짜여야 함)
  if (end_time !== undefined && (typeof end_time !== 'string' || !isValidDateTime(end_time))) {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      'end_time은 유효한 날짜시간 형식이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // 🔸 기타 선택 필드들에 대해 타입 검증
  if (memo !== undefined && typeof memo !== 'string') {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, 'memo는 문자열이어야 합니다.').body);
  }
  if (address !== undefined && typeof address !== 'string') {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, 'address는 문자열이어야 합니다.').body);
  }
  if (place_name !== undefined && typeof place_name !== 'string') {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, 'place_name은 문자열이어야 합니다.').body);
  }
  if (latitude !== undefined && typeof latitude !== 'number') {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, 'latitude는 숫자여야 합니다.').body);
  }
  if (longitude !== undefined && typeof longitude !== 'number') {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, 'longitude는 숫자여야 합니다.').body);
  }

  next();
};
