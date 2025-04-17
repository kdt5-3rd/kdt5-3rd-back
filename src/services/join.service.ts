import bcrypt from "bcryptjs";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

// 테스트용 사용자
const users = [
  {
    username: "dev",
    email: "dev@example.com",
    password: "plainpassword", // 테스트용 해쉬 생성 코드로 생성된 해쉬 값을 여기에 집어넣어야 확인 가능
  },
];

export const joinUserService = async (username:string, email: string, password: string) => {
  const checkEmail = users.find((u) => u.email === email);
  if (checkEmail) {
    const { status, body } = errorResponse(
      ERROR_CODES.CONFLICT,
      "존재하는 이메일입니다."
    );
    throw { ...body, status };
  }

};
