import bcrypt from "bcryptjs";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";
import { dbconnect } from "../db/db";

// 테스트용 사용자
const users = [
  {
    username: "dev",
    email: "dev@example.com",
    password: "plainpassword", // 테스트용 해쉬 생성 코드로 생성된 해쉬 값을 여기에 집어넣어야 확인 가능
  },
];

export const joinUserService = async (username: string, email: string, password: string) => {
  try {
    // 이메일 중복 확인
    const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
    const [rows]: any = await dbconnect.execute(checkEmailQuery, [email]);

    if (rows.length > 0) {
      // 이미 존재하는 이메일
      const { status, body } = errorResponse(
        ERROR_CODES.CONFLICT,
        "존재하는 이메일입니다."
      );
      throw { ...body, status };
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 데이터 삽입
    const insertUserQuery = 'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)';
    const [result]: any = await dbconnect.execute(insertUserQuery, [username, hashedPassword, email]);

    return {
      message: "회원가입 성공",
      userId: result.insertId, // 삽입된 사용자의 ID 반환
    };
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    throw error;
  }
};




