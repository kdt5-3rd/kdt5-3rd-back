import express from 'express';
import { getWeatherController } from '../controllers/weather.controller';

const router = express.Router();

router.get('/', getWeatherController);

export default router;
