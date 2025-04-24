import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/errorResponse';
import { ERROR_CODES } from '../../constants/errorCodes';
import { isValidDate } from '../../utils/validate/isValidDate';

/**
 * 📌 일정 조회 시 query 파라미터(year, month, day, week 등)의 유효성을 검사하는 범용 미들웨어 팩토리입니다.
 * 
 * - day 조회: year, month, day가 모두 필요하며 실제 존재하는 날짜여야 합니다.
 * - week 조회: year, month는 범위 내 정수, week는 1~6 사이의 정수여야 합니다.
 * - month 조회: year, month가 범위 내 정수여야 합니다.
 * 
 * @param type 'day' | 'week' | 'month' 중 하나. 해당 타입에 맞는 query 파라미터 검증
 * @returns Express 미들웨어 함수
 */
export const validateDateQuery = (type: 'day' | 'week' | 'month') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { year, month, day, week } = req.query;

        const y = Number(year);
        const m = Number(month);
        const d = Number(day);
        const w = Number(week);

        // 🔸 year는 공통적으로 1000~9999 범위의 숫자여야 함
        if (isNaN(y) || y < 1000 || y > 9999) {
            const { status, body } = errorResponse(
                ERROR_CODES.INVALID_PARAM,
                '올바른 연도(year)를 입력해주세요.'
            );
            res.status(status).json(body);
        }

        // 🔸 일간(day) 조회 유효성 검사
        if (type === 'day') {
            // month/day가 숫자가 아니거나 존재하지 않는 날짜 조합일 경우
            if (isNaN(m) || isNaN(d) || !isValidDate(y, m, d)) {
                const { status, body } = errorResponse(
                    ERROR_CODES.INVALID_PARAM,
                    '올바른 날짜(year, month, day)를 입력해주세요.'
                );
                res.status(status).json(body);
            }
        }

        // 🔸 주간(week) 조회 유효성 검사
        if (type === 'week') {
            // month: 1~12, week: 1~6 사이의 숫자
            if (isNaN(m) || m < 1 || m > 12 || isNaN(w) || w < 1 || w > 6) {
                const { status, body } = errorResponse(
                    ERROR_CODES.INVALID_PARAM,
                    '올바른 월(month)과 주차(week)를 입력해주세요.'
                );
                res.status(status).json(body);
            }
        }

        // 🔸 월간(month) 조회 유효성 검사
        if (type === 'month') {
            if (isNaN(m) || m < 1 || m > 12) {
                const { status, body } = errorResponse(
                    ERROR_CODES.INVALID_PARAM,
                    '올바른 월(month)을 입력해주세요.'
                );
                res.status(status).json(body);
            }
        }

        // 모든 유효성 검사를 통과한 경우 → 다음 미들웨어 또는 컨트롤러로 진행
        next();
    };
};
