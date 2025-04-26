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

const dailyRotateTransport = new DailyRotateFile({
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

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.printf(({ level, message, stack }) => {
      const timestamp = getKSTTimestamp();
      return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
    })
  ),
  transports: [
    dailyRotateTransport,
    errorRotateTransport
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}

export default logger;
