import express from 'express';
import { newsController } from '../controllers/news.controller'; 

const router = express.Router();

//뉴스 api 라우터
router.get('/', newsController); // GET 요청 처리



export default router;
