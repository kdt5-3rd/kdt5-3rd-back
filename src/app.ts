
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import userRouter from './routes/user.route';
import pingRouter from './routes/ping.route';
import taskRouter from './routes/task.route';
import searchRouter from './routes/search.route';
import { errorHandler } from './middlewares/errorHandler';

const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1분
const RATE_LIMIT_MAX_CALLS = 30;

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.set('trust proxy', 1);

app.use(express.json());

const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS, // 요청 제한 초기화 시간
    max: RATE_LIMIT_MAX_CALLS, // 분당 요청 제한 수치
    message: `해당 IP로부터 분당 ${RATE_LIMIT_MAX_CALLS}회 이상의 요청이 감지되었습니다. ${RATE_LIMIT_WINDOW_MS / 1000 / 60}분 뒤에 다시 시도해주세요.`,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// 테스트 API
app.use('/api/ping', pingRouter);

// 회원
app.use('/api/users', userRouter);

// 일정 등록, 수정, 삭제
app.use("/api/tasks", taskRouter);

// 네이버 장소 검색
app.use('/api/search', searchRouter);

// 공통 에러 핸들러
app.use(errorHandler);

export default app;
