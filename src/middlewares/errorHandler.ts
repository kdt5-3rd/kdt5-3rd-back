import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 로그 파일 및 콘솔에 기록 (stack, 요청 정보 포함)
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    status: err.status || 500,
    code: err.code || 'ERR_INTERNAL_SERVER',
    stack: err.stack || 'No stack',
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err.status && err.code) {
    res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details || null,
    });
  } else {
    res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};
