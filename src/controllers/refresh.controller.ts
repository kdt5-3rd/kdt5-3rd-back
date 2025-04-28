import { Request, Response, NextFunction } from "express";
import { generateToken } from "../utils/jwt";

interface RefreshResponseBody {
  success: true;
  accessToken: string;
}

export const refreshTokenController = (
  req: Request,
  res: Response<RefreshResponseBody>,
  next: NextFunction
): void => {
  const { id, email } = req.user!;
  const newAccessToken = generateToken({ id, email });
  res.status(200).json({ success: true, accessToken: newAccessToken });
};
