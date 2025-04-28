import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { dbconnect } from "../db/db";
import { verifyTokenString, verifyRefreshTokenString } from "../utils/jwt";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES, ErrorCode } from "../constants/errorCodes";

function sendError(res: Response, error: ErrorCode, customMessage?: string) {
  const { status, body } = errorResponse(error, customMessage);
  res.status(status).json(body);
}

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const raw = req.headers.authorization?.split(" ")[1];
  if (!raw) {
    return sendError(res, ERROR_CODES.UNAUTHORIZED);
  }

  let decoded: JwtPayload & { id: number; email: string };
  try {
    decoded = verifyTokenString(raw) as JwtPayload & {
      id: number;
      email: string;
    };
  } catch {
    return sendError(
      res,
      ERROR_CODES.UNAUTHORIZED,
      "유효하지 않은 액세스 토큰입니다."
    );
  }

  req.user = decoded;
  next();
};

export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const raw = req.body.refreshToken;
  if (!raw) {
    return sendError(res, ERROR_CODES.BAD_REQUEST);
  }

  let decoded: JwtPayload & { id: number; email: string };
  try {
    decoded = verifyRefreshTokenString(raw) as JwtPayload & {
      id: number;
      email: string;
    };
  } catch {
    return sendError(
      res,
      ERROR_CODES.UNAUTHORIZED,
      "유효하지 않은 리프레시 토큰입니다."
    );
  }

  const [rows] = await dbconnect.execute(
    "SELECT refresh_token FROM users WHERE user_id = ?",
    [decoded.id]
  );
  const dbToken = (rows as any[])[0]?.refresh_token;
  if (dbToken !== raw) {
    return sendError(
      res,
      ERROR_CODES.UNAUTHORIZED,
      "리프레시 토큰이 일치하지 않습니다."
    );
  }

  req.user = decoded;
  next();
};
