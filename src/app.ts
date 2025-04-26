import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Sentry from '@sentry/node';
import userRouter from './routes/user.route';
import pingRouter from './routes/ping.route';
import taskRouter from './routes/task.route';
import searchRouter from './routes/search.route';
import joinRouter from './routes/join.route';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import morgan from 'morgan';
import logger from './utils/logger';

// API 요청 제한 수치 설정용 상수
// 요청 제한 기준 시간, 요청 제한 횟수 설정
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1분
const RATE_LIMIT_MAX_CALLS = 30;

// Express 모듈 호출 (최상단, 위치 절대 손대지 말 것!)
const app = express();

// CORS 설정, 로컬 개발 클라이언트(개발 도중에만 유효) 및 프론트 배포 URL (예정) 에서 오는 요청을 허용
const allowedOrigins = [
    'http://localhost:3000',
    'https://ttolgaebi.com',
];

app.use(cors({
    origin: (origin, callback) => {
        // origin이 undefined가 아닌 경우만 .includes() 실행되도록.
        if (origin && allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS 차단됨: ' + origin));
        }
    },
    credentials: true,
}));

// 배포 환경에서 API 요청 제한 기능 사용을 위한 설정
// 실제 IP 주소는 Proxy 서버보다 1단계 뒤에 있음을 SET
app.set('trust proxy', 1);

// 에러 로깅 기능
// morgan 로그를 winston으로 전달
app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    }
}));

// JSON 모듈 사용 설정 (절대 손대지 말 것!)
app.use(express.json());

// API 요청 제한 기능 설정 및 모듈 호출
const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS, // 요청 제한 초기화 시간
    max: RATE_LIMIT_MAX_CALLS, // 분당 요청 제한 수치
    message: `해당 IP로부터 분당 ${RATE_LIMIT_MAX_CALLS}회 이상의 요청이 감지되었습니다. ${RATE_LIMIT_WINDOW_MS / 1000 / 60}분 뒤에 다시 시도해주세요.`,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// 테스트 API Router
app.use('/api/ping', pingRouter);

// 회원 API Router
app.use('/api/users', userRouter);

// 일정 API Router
app.use("/api/tasks", taskRouter);

// 네이버 장소 검색 API Router
app.use('/api/search', searchRouter);

// 회원가입 API Router
app.use('/api/join', joinRouter);

// Sentry 에러 핸들러 등록 (라우터 뒤에, 에러 핸들러 앞에 위치해야 함)
Sentry.setupExpressErrorHandler(app);

// 404 대응 핸들러 (이 코드는 Router 연결 코드보다 뒤에 위치해 있어야 함.) (절대 손대지 말 것!)
app.use(notFoundHandler);

// 공통 에러 핸들러 사용 설정 (이 코드는 다른 서버코드 보다 가장 뒤에 위치해 있어야 함) (절대 손대지 말 것!)
app.use(errorHandler);

export default app;
