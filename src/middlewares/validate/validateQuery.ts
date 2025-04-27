import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/errorResponse';
import { ERROR_CODES } from '../../constants/errorCodes';

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const { status, body } = errorResponse(
        ERROR_CODES.INVALID_PARAM,
        result.error.errors[0]?.message || '잘못된 요청입니다.',
        { fields: result.error.errors.map((e) => e.path.join('.')) }
      );
      res.status(status).json(body);
      return;
    }

    (req as any).validatedQuery = result.data;
    next();
  };
};