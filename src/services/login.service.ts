import bcrypt from "bcryptjs";
import { dbconnect } from "../db/db";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

type UserRow = {
  user_id: number;
  email: string;
  password_hash: string;
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const loginUserService = async (
  email: string,
  password: string
): Promise<AuthTokens> => {
  const [rows] = await dbconnect.execute(
    "SELECT user_id, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  const users = rows as UserRow[];
  const user = users[0];
  if (!user) {
    const { status, body } = errorResponse(
      ERROR_CODES.UNAUTHORIZED,
      "등록된 사용자가 아닙니다."
    );
    throw { ...body, status };
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const { status, body } = errorResponse(
      ERROR_CODES.UNAUTHORIZED,
      "비밀번호가 일치하지 않습니다."
    );
    throw { ...body, status };
  }

  const accessToken = generateToken({ id: user.user_id, email: user.email });
  const refreshToken = generateRefreshToken({
    id: user.user_id,
    email: user.email,
  });

  await dbconnect.execute(
    "UPDATE users SET refresh_token = ? WHERE user_id = ?",
    [refreshToken, user.user_id]
  );

  return { accessToken, refreshToken };
};
