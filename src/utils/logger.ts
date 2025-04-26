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
    format.printf((info) => {
      const timestamp = getKSTTimestamp();
      
      // stack이 있으면 stack 출력, 아니면 message
      let log = `${timestamp} [${info.level.toUpperCase()}] ${info.stack || info.message}`;
    
      // 추가적인 메타데이터 (userId, params, query, body 등)가 있으면 JSON 형태로 출력
      const { userId, params, query, body, status, code, ...rest } = info;
      
      const additional = { userId, params, query, body, status, code, ...rest };
      const cleanAdditional = Object.fromEntries(
        Object.entries(additional).filter(([_, v]) => v !== undefined)
      );
    
      if (Object.keys(cleanAdditional).length > 0) {
        log += ` ${JSON.stringify(cleanAdditional)}`;
      }
    
      return log;
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
