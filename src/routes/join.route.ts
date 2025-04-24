import express from 'express';
import { joinController } from '../controllers/join.controller';

const router = express.Router();

//회원가입 라우터
router.post('/',joinController);



export default router;
