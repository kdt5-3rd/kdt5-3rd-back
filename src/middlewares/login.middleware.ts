import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      code: "ERR_NO_TOKEN",
      message: "토큰이 없습니다.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as JwtPayload & { id: number; email: string };
    next();
  } catch {
    res.status(401).json({
      success: false,
      code: "ERR_INVALID_TOKEN",
      message: "유효하지 않은 토큰입니다.",
    });
  }
};
