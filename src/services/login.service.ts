import bcrypt from "bcryptjs";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

// 테스트용 사용자
const users = [
  {
    id: 1,
    email: "dev@example.com",
    password: "plainpassword", // 테스트용 해쉬 생성 코드로 생성된 해쉬 값을 여기에 집어넣어야 확인 가능
  },
];

export const loginUserService = async (email: string, password: string) => {
  const user = users.find((u) => u.email === email);
  if (!user) {
    const { status, body } = errorResponse(
      ERROR_CODES.UNAUTHORIZED,
      "존재하지 않는 사용자입니다."
    );
    throw { ...body, status };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const { status, body } = errorResponse(
      ERROR_CODES.UNAUTHORIZED,
      "비밀번호가 일치하지 않습니다."
    );
    throw { ...body, status };
  }

  return user;
};
