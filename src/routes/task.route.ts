import express from 'express';
import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
  getTasksByDayController,
  getTasksByWeekController,
  getTasksByMonthController,
} from '../controllers/task.controller';

const router = express.Router();

// 일정 등록, 수정, 삭제
router.post('/', createTaskController);
router.patch('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

// 일정 조회 (일간, 주간, 월간)
router.get('/day', getTasksByDayController);
router.get('/week', getTasksByWeekController);
router.get('/month', getTasksByMonthController);

export default router;
