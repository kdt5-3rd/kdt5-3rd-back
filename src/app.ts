import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Sentry from "@sentry/node";
import userRouter from "./routes/user.route";
import pingRouter from "./routes/ping.route";
import taskRouter from "./routes/task.route";
import searchRouter from "./routes/search.route";
import joinRouter from "./routes/join.route";
import weatherRouter from "./routes/weather.route";
import newsRouter from "./routes/news.route";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import morgan from "morgan";
import logger from "./utils/logger";

// API 요청 제한 수치 설정용 상수
// 요청 제한 기준 시간, 요청 제한 횟수 설정
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1분
const RATE_LIMIT_MAX_CALLS = 30;

// Express 모듈 호출 (최상단, 위치 절대 손대지 말 것!)
const app = express();

// CORS 설정, 로컬 개발 클라이언트(개발 도중에만 유효) 및 프론트 배포 URL (예정) 에서 오는 요청을 허용
const allowedOrigins = ["http://localhost:3000", "https://ttolgaebi.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, false); // CORS 정책 위반 시 그냥 요청 거부
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // 에러 던지지 말고 '거부'만
      }
    },
    credentials: true,
  })
);

// 배포 환경에서 API 요청 제한 기능 사용을 위한 설정
// 실제 IP 주소는 Proxy 서버보다 1단계 뒤에 있음을 SET
app.set("trust proxy", 1);

// 에러 로깅 기능
// 응답 시간 계산 미들웨어
app.use((req, res, next) => {
  const start = process.hrtime();

  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (
    statusCode: number,
    reasonPhrase?: string | any,
    headers?: any
  ): Response {
    const elapsed = process.hrtime(start);
    const ms = elapsed[0] * 1000 + elapsed[1] / 1e6;
    res.setHeader("X-Response-Time", ms.toFixed(3));

    // 타입 명확히 지정하고 호출
    if (typeof reasonPhrase === "string") {
      return originalWriteHead(statusCode, reasonPhrase, headers);
    } else {
      return originalWriteHead(statusCode, reasonPhrase);
    }
  } as any; // (타입 오류 없애기 위해 최종적으로 any로 강제 변환)

  next();
});

// morgan 커스텀 토큰: JSON 포맷으로 요청 정보 + 응답 시간 기록
morgan.token("json", (req, res) => {
  const request = req as Request;
  const response = res as Response;

  return JSON.stringify({
    method: request.method,
    url: request.originalUrl,
    status: response.statusCode,
    ip: request.ip,
    userAgent: request.headers["user-agent"],
    responseTime: res.getHeader("X-Response-Time") || null,
    timestamp: new Date().toISOString(),
  });
});

// morgan으로 모든 요청 로깅
app.use(
  morgan(":json", {
    stream: {
      write: (message: string) => {
        const log = JSON.parse(message);

        // 항상 combined 기록
        logger.info(log.message || `${log.method} ${log.url}`, log, {
          onlyCombined: true,
        });

        // 에러 또는 성공 정확히 분기
        if (log.status >= 400) {
          logger.error(log.message || `${log.method} ${log.url}`, log); // 4xx, 5xx
        } else if (log.status >= 100 && log.status < 400) {
          logger.success(log.message || `${log.method} ${log.url}`, log); // 1xx, 2xx, 3xx
        }
      },
    },
  })
);

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

// 민감 경로 보호 미들웨어
app.use((req, res, next) => {
  const forbiddenPaths = [
    "/.env",
    "/.git",
    "/config.json",
    "/phpmyadmin",
    "/phpunit",
    "/vendor",
    "/lib",
    "/laravel",
    "/public",
    "/admin",
    "/cms",
    "/crm",
    "/workspace",
    "/tests",
    "/test",
    "/demo",
    "/panel",
    "/apps",
    "/app",
    "/tmp",
    "/storage",
    "/backup",
    "/logs",
    "/web",
    "/system",
  ];
  const requestPath = req.path.toLowerCase();
  if (forbiddenPaths.some((forbidden) => requestPath.startsWith(forbidden))) {
    logger.warn(`[보안경고] 민감 경로 접근 시도: ${req.path}`);
    res.status(403).send("Forbidden");
    return;
  }
  next();
});

// favicon.ico 요청 무시 (불필요한 에러 방지)
app.get("/favicon.ico", (req, res): void => {
  res.status(204).end();
});

// 테스트 API Router
app.use("/api/ping", pingRouter);

// 회원 API Router
app.use("/api/users", userRouter);

// 일정 API Router
app.use("/api/tasks", taskRouter);

// 네이버 장소 검색 API Router
app.use("/api/search", searchRouter);

// 회원가입 API Router
app.use("/api/join", joinRouter);

// 날씨 API Router
app.use("/api/weather", weatherRouter);

//뉴스 api 라우터
app.use("/api/external/news", newsRouter);

// Sentry 에러 핸들러 등록 (라우터 뒤에, 에러 핸들러 앞에 위치해야 함)
Sentry.setupExpressErrorHandler(app);

// 404 대응 핸들러 (이 코드는 Router 연결 코드보다 뒤에 위치해 있어야 함.) (절대 손대지 말 것!)
app.use(notFoundHandler);

// 공통 에러 핸들러 사용 설정 (이 코드는 다른 서버코드 보다 가장 뒤에 위치해 있어야 함) (절대 손대지 말 것!)
app.use(errorHandler);

export default app;
