import express from 'express';
import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
} from '../controllers/task.controller';
import { completeTask, postponeTask } from '../services/task.service';

const router = express.Router();

router.post('/', createTaskController);
router.patch('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

router.patch('/:id/complete', completeTask);
router.patch('/:id/postpone', postponeTask);

export default router;
