import express from "express";
import {
  loginController,
  validateTokenController,
} from "../controllers/login.controller";
import { logoutController } from "../controllers/logout.controller";
import { verifyToken } from "../middlewares/login.middleware";

const router = express.Router();

// 로그인
router.post("/login", loginController);

// 로그인 상태 유효성 검사
router.get("/validate", verifyToken, validateTokenController);

// 로그아웃
router.post("/logout", verifyToken, logoutController);

export default router;
