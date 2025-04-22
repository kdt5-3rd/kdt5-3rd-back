// src/controllers/logout.controller.ts
import { Request, Response, NextFunction } from "express";
import { logoutUserService } from "../services/logout.service";

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { refreshToken } = req.body;

    if (!userId || !refreshToken) {
      res.status(400).json({
        success: false,
        code: "ERR_BAD_REQUEST",
        message: "userId 또는 refreshToken이 누락되었습니다.",
      });
      return;
    }

    await logoutUserService(userId, refreshToken);

    res.status(200).json({
      success: true,
      message: "로그아웃 되었습니다.",
    });
  } catch (err) {
    next(err);
  }
};
