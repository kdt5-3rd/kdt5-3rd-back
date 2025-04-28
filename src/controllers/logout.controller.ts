import { Request, Response, NextFunction } from "express";
import { logoutUserService } from "../services/logout.service";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

interface LogoutRequestBody {
  refreshToken: string;
}
interface LogoutResponseBody {
  success: true;
  message: string;
}

export const logoutController = async (
  req: Request<{}, {}, LogoutRequestBody>,
  res: Response<LogoutResponseBody>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { refreshToken } = req.body;
    if (!refreshToken) {
      const { status, body } = errorResponse(
        ERROR_CODES.BAD_REQUEST,
        "리프레시 토큰이 필요합니다."
      );
      return next({ ...body, status });
    }
    await logoutUserService(userId, refreshToken);
    res.status(200).json({ success: true, message: "로그아웃 되었습니다." });
  } catch (err) {
    next(err);
  }
};
