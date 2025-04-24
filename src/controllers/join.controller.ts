import { Request, Response, NextFunction } from "express";
import { joinUserService } from "../services/join.service";
import { dbconnect } from "../db/db";

export const joinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

  // 필수 필드 확인
  if (!username || !email || !password) {
     res.status(400).json({ 
      success: false,
      message: '모든 값를 입력해주세요.' });
  }

  try {
    console.log("controller1");

    await joinUserService(username, email, password);



    res.status(201).json({
      success: true,
      message: "회원가입에 성공했습니다.",
    });
  } catch (err) {
    next(err);
  }
};

//회원 정보 조회
export const joinCheck =async (req: Request, res: Response, next: NextFunction) => {
  try {

    const query = "SELECT username, email FROM users"; // 비밀번호는 제외하고 조회
    const [rows]: any = await dbconnect.execute(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("회원 정보 조회 중 오류 발생:", err);
    next(err);
  }
};
