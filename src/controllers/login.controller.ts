import { Request, Response, NextFunction } from "express";
import { loginUserService } from "../services/login.service";
import { generateToken } from "../utils/jwt";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await loginUserService(email, password);

    const accessToken = generateToken({ id: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      data: {
        accessToken,
        refreshToken: "DUMMY_REFRESH_TOKEN",
      },
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
