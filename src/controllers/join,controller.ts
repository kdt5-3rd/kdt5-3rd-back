import { Request, Response, NextFunction } from "express";


export const joinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      data: {
      },
    });
  } catch (err) {
    next(err);
  }
};
