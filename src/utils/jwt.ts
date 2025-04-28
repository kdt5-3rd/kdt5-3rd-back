import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}
if (!REFRESH_SECRET) {
  throw new Error("REFRESH_SECRET is not defined in .env");
}

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyTokenString = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshTokenString = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET);
};
