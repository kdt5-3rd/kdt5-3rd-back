import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: true, // IP 주소나 사용자 세션 추적 허용
  tracesSampleRate: 1.0,
});