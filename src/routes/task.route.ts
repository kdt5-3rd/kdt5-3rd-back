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
import { validateDateQuery } from '../middlewares/validate/validateDayQuery';
import { validateTaskBody } from '../middlewares/validate/validateTaskBody';

const router = express.Router();

// 일정 등록, 수정, 삭제
router.post('/', validateTaskBody, createTaskController);
router.patch('/:id', validateTaskBody, updateTaskController);
router.delete('/:id', deleteTaskController);

// 📌 일정 경로 계산
router.get('/:id/path', getTaskPathController);

// 일정 조회 (일간, 주간, 월간)
router.get('/day', validateDateQuery('day'), getTasksByDayController);
router.get('/week', validateDateQuery('week'), getTasksByWeekController);
router.get('/month', validateDateQuery('month'), getTasksByMonthController);

export default router;
