import express from 'express';
import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
} from '../controllers/task.controller';

const router = express.Router();

router.post('/', createTaskController);
router.patch('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

export default router;
