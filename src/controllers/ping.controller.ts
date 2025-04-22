import { Request, Response, NextFunction } from 'express';
import { pingService, registerUser } from '../services/ping.service';

export const pingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pingService();
    res.status(200).json({ success: true, message: '퐁!', serverTime: result });
  } catch (err) {
    next(err);
  }
};

// 에러 처리 로직 예시..
export const signupController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await registerUser(email, password);

    res.status(201).json({
      success: true,
      message: '회원가입 성공',
      data: result,
    });
  } catch (err) {
    next(err); // errorHandler에서 처리
  }
};