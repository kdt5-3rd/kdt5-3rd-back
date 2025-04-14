import express from 'express';
import { searchPlaceController } from '../controllers/search.controller';

const router = express.Router();

// 키워드 검색
router.get('/places', searchPlaceController);

export default router;
