import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/errorResponse';
import { ERROR_CODES } from '../../constants/errorCodes';

// 좌표값 "" 검증
const normalizeCoord = (value: any): number | undefined => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

/**
 * 📌 일정 등록/수정 시 Body 값에 대해 유효성 검사를 수행하는 미들웨어
 * 
 * ✅ 실무 기준 필수 검증:
 * - title: 필수, 문자열, 최대 255자
 * - start_time: 필수, ISO 형식 날짜
 * - end_time: 선택, ISO 형식 날짜, start_time보다 늦어야 함
 * - latitude, longitude: 선택, 숫자이며 각도 범위 내
 * - memo, address, place_name: 존재 시 문자열인지 검사
 */
export const validateTaskBody = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, start_time, end_time,
    memo, address, place_name,
    from_lat, from_lng, latitude, longitude,
  } = req.body;

  // ✅ title: 필수, 문자열, 최대 255자
  if (typeof title !== 'string' || title.trim() === '') {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      '일정 제목(title)은 필수이며 비어 있을 수 없습니다.'
    );
    res.status(status).json(body);
  }
  if (title.length > 255) {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      '일정 제목(title)은 최대 255자까지 입력 가능합니다.'
    );
    res.status(status).json(body);
  }

  // ✅ start_time: 필수, ISO 8601 날짜 형식
  if (typeof start_time !== 'string' || isNaN(Date.parse(start_time))) {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      'start_time은 유효한 날짜/시간 문자열(ISO 8601 형식)이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // ✅ end_time: 선택, 날짜 형식이며 start_time보다 뒤여야 함
  if (end_time !== undefined) {
    if (typeof end_time !== 'string' || isNaN(Date.parse(end_time))) {
      const { status, body } = errorResponse(
        ERROR_CODES.INVALID_PARAM,
        'end_time은 유효한 날짜/시간 문자열이어야 합니다.'
      );
      res.status(status).json(body);
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    if (start > end) {
      const { status, body } = errorResponse(
        ERROR_CODES.INVALID_PARAM,
        'end_time은 start_time보다 같거나 뒤여야 합니다.'
      );
      res.status(status).json(body);
    }
  }

  // ✅ memo: 선택, 존재 시 문자열
  if (memo !== undefined && typeof memo !== 'string') {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      'memo는 문자열이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // ✅ address: 선택, 존재 시 문자열
  if (address !== undefined && typeof address !== 'string') {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      'address는 문자열이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // ✅ place_name: 선택, 존재 시 문자열
  if (place_name !== undefined && typeof place_name !== 'string') {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      'place_name은 문자열이어야 합니다.'
    );
    res.status(status).json(body);
  }

  // ✅ 위도-경도 범위 유효성 검증
  const coords = {
    latitude: normalizeCoord(latitude),
    longitude: normalizeCoord(longitude),
    from_lat: normalizeCoord(from_lat),
    from_lng: normalizeCoord(from_lng),
  };

  if (coords.latitude !== undefined && (coords.latitude < -90 || coords.latitude > 90)) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, '위도는 -90 이상 90 이하의 숫자여야 합니다.', { fields: ['latitude'] }).body);
  }
  if (coords.longitude !== undefined && (coords.longitude < -180 || coords.longitude > 180)) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, '경도는 -180 이상 180 이하의 숫자여야 합니다.', { fields: ['longitude'] }).body);
  }
  if (coords.from_lat !== undefined && (coords.from_lat < -90 || coords.from_lat > 90)) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, '출발지 위도는 -90 이상 90 이하의 숫자여야 합니다.', { fields: ['from_lat'] }).body);
  }
  if (coords.from_lng !== undefined && (coords.from_lng < -180 || coords.from_lng > 180)) {
    res.status(400).json(errorResponse(ERROR_CODES.INVALID_PARAM, '출발지 경도는 -180 이상 180 이하의 숫자여야 합니다.', { fields: ['from_lng'] }).body);
  }

  // 모든 검사를 통과한 경우 다음 단계로 이동
  next();
};
