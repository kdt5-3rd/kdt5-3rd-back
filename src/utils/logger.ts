import { createLogger, transports, format } from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const getKSTTimestamp = () => dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
const logDir = path.join(__dirname, '../../logs');

// 로그 파일별 Transport 설정
const combinedRotateTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-combined.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const errorRotateTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-error.log`,
  level: 'error',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
});

const successRotateTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-success.log`,
  level: 'info',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d',
});

// Winston Logger 기본 설정
const baseLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: () => getKSTTimestamp() }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    combinedRotateTransport,
    errorRotateTransport,
    successRotateTransport,
  ],
});

if (process.env.NODE_ENV !== 'production') {
  baseLogger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

// 최종 Export 객체
const logger = {
  info: (message: string, meta?: any, options?: { onlyCombined?: boolean }) => {
    if (options?.onlyCombined) {
      baseLogger.info(message, meta);
    }
  },
  warn: (message: string, meta?: any) => baseLogger.warn(message, meta),
  error: (message: string, meta?: any) => baseLogger.error(message, meta),
  success: (message: string, meta?: any) => {
    baseLogger.log({ level: 'info', message, ...(meta && { meta }) });
  },
};

export default logger;