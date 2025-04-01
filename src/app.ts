import express from 'express';
import userRouter from './routes/user.route';
import pingRouter from './routes/ping.route';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use('/api/ping', pingRouter);
app.use('/api/users', userRouter);

// 공통 에러 핸들러
app.use(errorHandler);

export default app;
