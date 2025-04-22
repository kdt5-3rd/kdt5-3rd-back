import { dbconnect } from "../db/db";
import { errorResponse } from "../utils/errorResponse";
import { ERROR_CODES } from "../constants/errorCodes";

export const logoutUserService = async (
  userId: number,
  refreshToken: string
) => {
  const [rows] = await dbconnect.execute(
    "SELECT refresh_token FROM users WHERE user_id = ?",
    [userId]
  );

  const users = rows as any[];
  const user = users[0];

  if (!user || user.refresh_token !== refreshToken) {
    const { status, body } = errorResponse(
      ERROR_CODES.UNAUTHORIZED,
      "refreshToken이 일치하지 않습니다."
    );
    throw { ...body, status };
  }

  await dbconnect.execute(
    "UPDATE users SET refresh_token = NULL WHERE user_id = ?",
    [userId]
  );
};
