import { Request, Response, NextFunction } from 'express';
import { createTask, deleteTask, updateTask } from '../services/task.service';

export const createTaskController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1;
    const data = req.body;
    const result = await createTask(userId, data);

    res.status(201).json({
      success: true,
      message: '일정이 등록되었습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaskController = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = 1;
      const taskId = Number(req.params.id);
      const result = await updateTask(userId, taskId, req.body);
  
      res.status(200).json({
        success: true,
        message: '일정이 수정되었습니다.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
};

export const deleteTaskController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1;
    const taskId = Number(req.params.id);
    const result = await deleteTask(userId, taskId);

    res.status(200).json({
      success: true,
      message: '일정이 삭제되었습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
