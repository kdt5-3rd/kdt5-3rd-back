import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyTokenString = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
