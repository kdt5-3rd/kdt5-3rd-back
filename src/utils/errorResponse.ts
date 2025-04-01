import { ErrorCode } from '../constants/errorCodes';

export const errorResponse = (
  error: ErrorCode,
  customMessage?: string,
  details?: any
) => {
  const body: any = {
    success: false,
    code: error.code,
    message: customMessage || error.message,
  };
  if (details) body.details = details;

  return { status: error.status, body };
};
