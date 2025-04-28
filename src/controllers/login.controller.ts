import { Request, Response, NextFunction } from "express";
import { loginUserService } from "../services/login.service";

interface LoginRequestBody {
  email: string;
  password: string;
}
interface LoginResponseBody {
  success: true;
  accessToken: string;
  refreshToken: string;
}

export const loginController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response<LoginResponseBody>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await loginUserService(
      email,
      password
    );
    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

interface ValidateTokenResponse {
  success: true;
  message: string;
}
export const validateTokenController = (
  _req: Request,
  res: Response<ValidateTokenResponse>
): void => {
  res.status(200).json({ success: true, message: "토큰이 유효합니다." });
};
