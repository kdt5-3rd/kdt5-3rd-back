import { Request, Response, NextFunction } from 'express';
import { createTask, deleteTask, getTaskById, getTasksByDay, getTasksByMonth, getTasksByWeek, updateTask } from '../services/task.service';
import { getTravelInfoDetailed } from '../utils/getTravelInfoDetailed';

export const createTaskController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId =  1;

    const result = await createTask(userId, req.body);

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

export const getTasksByDayController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1;
    const result = await getTasksByDay(userId, req.query);

    res.status(200).json({
      success: true,
      message: (result as any[]).length > 0 ? '일간 일정을 조회하였습니다.' : '해당 날짜의 일정이 없습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByWeekController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1;
    const result = await getTasksByWeek(userId, req.query);

    res.status(200).json({
      success: true,
      message: (result as any[]).length > 0 ? '주간 일정을 조회하였습니다.' : '해당 날짜의 일정이 없습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByMonthController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1;
    const result = await getTasksByMonth(userId, req.query);
    
    res.status(200).json({
      success: true,
      message: (result as any[]).length > 0 ? '월간 일정을 조회하였습니다.' : '해당 날짜의 일정이 없습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 경로 계산 컨트롤러
export const getTaskPathController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = Number(req.params.id);
    const task = await getTaskById(taskId);

    const result = await getTravelInfoDetailed({
      from: {
        lat: task.from_lat,
        lng: task.from_lng,
        option: task.route_option
      },
      to: {
        lat: task.latitude,
        lng: task.longitude
      },
      startTime: task.start_time
    });

    res.status(200).json({
      success: true,
      message: '경로 정보를 계산하였습니다.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};