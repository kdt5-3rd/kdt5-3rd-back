import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

function sendUnauthorized(next: NextFunction, message: string) {
  const { status, body } = errorResponse(ERROR_CODES.UNAUTHORIZED, message);
  next({ ...body, status });
}

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return sendUnauthorized(next, "토큰이 없습니다.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as JwtPayload & { id: number; email: string };
    next();
  } catch {
    return sendUnauthorized(next, "유효하지 않은 토큰입니다.");
  }
};
