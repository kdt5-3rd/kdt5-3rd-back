import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { maskSensitiveData } from '../utils/maskSensitiveData';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req.user as { id?: number })?.id || 'anonymous';
  const status = err.status || 500;

  const logMeta = {
    userId,
    ip: req.ip,
    body: maskSensitiveData(req.body),
    query: maskSensitiveData(req.query),
    params: maskSensitiveData(req.params),
    stack: err.stack,
    status,
    code: err.code || 'ERR_INTERNAL_SERVER',
  };

  const message = `[${req.method}] ${req.originalUrl} - ${err.message}`;

  logger.error(message, logMeta);

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
