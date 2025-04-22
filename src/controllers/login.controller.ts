import { Request, Response, NextFunction } from "express";
import { loginUserService } from "../services/login.service";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await loginUserService(
      email,
      password
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const validateTokenController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      message: "토큰이 유효합니다.",
    });
  } catch (err) {
    next(err);
  }
};
