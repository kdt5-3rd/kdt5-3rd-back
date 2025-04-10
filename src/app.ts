
import express from 'express';
import userRouter from './routes/user.route';
import pingRouter from './routes/ping.route';
import taskRouter from './routes/task.route';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// 테스트 API
app.use('/api/ping', pingRouter);

// 회원
app.use('/api/users', userRouter);

// 일정 등록, 수정, 삭제
app.use("/api/tasks", taskRouter);

// 공통 에러 핸들러
app.use(errorHandler);

export default app;
