import { RequestHandler } from 'express';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';

export const notFoundHandler: RequestHandler = (req, res) => {
    const { status, body } = errorResponse(
        ERROR_CODES.NOT_FOUND,
        'API 엔드포인트를 찾을 수 없습니다.'
    );
    res.status(status).json(body);
};
