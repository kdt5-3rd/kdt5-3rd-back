import express from 'express';
import { joinController } from '../controllers/join,controller';

const router = express.Router();

router.get('/',joinController);

export default router;
