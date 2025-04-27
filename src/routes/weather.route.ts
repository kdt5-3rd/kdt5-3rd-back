import express from "express";
import { weatherController } from "../controllers/weather.controller";

const router = express.Router();

// 날씨 조회
router.get("/", weatherController);

export default router;
