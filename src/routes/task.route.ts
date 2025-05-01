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

const router = express.Router();

// ✅ 일정 등록, 수정, 삭제
router.post('/', validateBody(TaskBodySchema), createTaskController);
router.patch('/:id', validateBody(TaskBodySchema), updateTaskController);
router.delete('/:id', deleteTaskController);

// ✅ 일정 경로 계산
router.get('/:id/path', getTaskPathController);

// ✅ 일정 조회 (일간, 주간, 월간)
router.get('/day', validateQuery(DayQuerySchema), getTasksByDayController);
router.get('/week', validateQuery(WeekQuerySchema), getTasksByWeekController);
router.get('/month', validateQuery(MonthQuerySchema), getTasksByMonthController);

export default router;
