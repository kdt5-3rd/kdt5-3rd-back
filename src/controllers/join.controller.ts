import { Request, Response, NextFunction } from "express";
import { joinUserService } from "../services/join.service";
const crypto = require('crypto'); //암호화

export const joinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("controller1");
    
    const { username, email, password } = req.body;
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
    console.log(hashPassword);
    await joinUserService(username, email, hashPassword);

    // 비밀번호 해쉬화


    res.status(201).json({
      success: true,
      message: "회원가입에 성공했습니다.",
    });
  } catch (err) {
    next(err);
  }
};
