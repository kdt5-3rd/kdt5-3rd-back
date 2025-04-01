import express from 'express';
import { signupController } from '../controllers/ping.controller';

const router = express.Router();

router.post('/signup', signupController);

export default router;
