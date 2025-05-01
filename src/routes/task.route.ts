import express from 'express';
import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
  getTasksByDayController,
  getTasksByWeekController,
  getTasksByMonthController,
  getTaskPathController,
} from '../controllers/task.controller';

import { TaskBodySchema, DayQuerySchema, WeekQuerySchema, MonthQuerySchema } from '../types/task';
import { validateBody } from '../middlewares/validate/validateBody';
import { validateQuery } from '../middlewares/validate/validateQuery';
import { verifyAccessToken } from '../middlewares/login.middleware';

const router = express.Router();

// ✅ 일정 등록, 수정, 삭제
router.post('/', verifyAccessToken, validateBody(TaskBodySchema), createTaskController);
router.patch('/:id', verifyAccessToken, validateBody(TaskBodySchema), updateTaskController);
router.delete('/:id', verifyAccessToken, deleteTaskController);

// ✅ 일정 경로 계산
router.get('/:id/path', verifyAccessToken, getTaskPathController);

// ✅ 일정 조회 (일간, 주간, 월간)
router.get('/day', verifyAccessToken, validateQuery(DayQuerySchema), getTasksByDayController);
router.get('/week', verifyAccessToken, validateQuery(WeekQuerySchema), getTasksByWeekController);
router.get('/month', verifyAccessToken, validateQuery(MonthQuerySchema), getTasksByMonthController);

export default router;
