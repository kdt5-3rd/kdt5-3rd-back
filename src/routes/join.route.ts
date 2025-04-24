import express from 'express';
import { joinController, joinCheck } from '../controllers/join.controller';

const router = express.Router();

//회원가입 라우터
router.post('/',joinController);

//회원 여무 확인 라우터
router.get('/check',joinCheck);

export default router;
