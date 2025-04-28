import express from "express";
import {
  loginController,
  validateTokenController,
} from "../controllers/login.controller";
import { logoutController } from "../controllers/logout.controller";
import { refreshTokenController } from "../controllers/refresh.controller";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares/login.middleware";

const router = express.Router();

router.post("/login", loginController);
router.get("/validate", verifyAccessToken, validateTokenController);
router.post("/logout", verifyAccessToken, logoutController);
router.post("/refresh", verifyRefreshToken, refreshTokenController);

export default router;
