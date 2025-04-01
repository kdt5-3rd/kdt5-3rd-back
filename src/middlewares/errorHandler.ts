import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err); // 서버 로깅

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
