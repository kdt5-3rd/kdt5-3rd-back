import express from "express";
import {
  loginController,
  validateTokenController,
} from "../controllers/login.controller";
import { verifyToken } from "../middlewares/login.middleware";

const router = express.Router();

router.post("/login", loginController);
router.get("/validate", verifyToken, validateTokenController);

export default router;
