import { Request, Response, NextFunction } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByDay,
  getTasksByMonth,
  getTasksByWeek,
  updateTask,
} from '../services/task.service';
import { getTravelInfoDetailed } from '../utils/getTravelInfoDetailed';
import { DayQueryInput, MonthQueryInput, WeekQueryInput } from '../types/task';

// 📌 일정 생성
export const createTaskController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
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

// 📌 일정 수정
export const updateTaskController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
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

// 📌 일정 삭제
export const deleteTaskController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
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

// 📌 일간 조회
export const getTasksByDayController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const query = (req as any).validatedQuery as DayQueryInput; 
    const result = await getTasksByDay(userId, query);

    res.status(200).json({
      success: true,
      message: result.length > 0 ? '일간 일정을 조회하였습니다.' : '해당 날짜의 일정이 없습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 📌 주간 조회
export const getTasksByWeekController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const query = (req as any).validatedQuery as WeekQueryInput;
    const result = await getTasksByWeek(userId, query);

    res.status(200).json({
      success: true,
      message: result.length > 0 ? '주간 일정을 조회하였습니다.' : '해당 날짜의 일정이 없습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 📌 월간 조회
export const getTasksByMonthController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const query = (req as any).validatedQuery as MonthQueryInput;
    const result = await getTasksByMonth(userId, query);

    res.status(200).json({
      success: true,
      message: result.length > 0 ? '월간 일정을 조회하였습니다.' : '해당 날짜의 일정이 없습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 📌 경로 계산
export const getTaskPathController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = Number(req.params.id);
    const task = await getTaskById(taskId);

    const hasValidCoords =
      task.latitude !== null && task.longitude !== null &&
      task.from_lat !== null && task.from_lng !== null &&
      task.latitude !== 0 && task.longitude !== 0 &&
      task.from_lat !== 0 && task.from_lng !== 0;

    if (!hasValidCoords) {
      res.status(200).json({
        success: false,
        message: '경로 계산에 필요한 출발지 또는 도착지 정보가 없습니다.',
      });
      return;
    }

    if (!task.end_time) {
      return res.status(400).json({
        success: false,
        message: '도착 예정 시간이 없어 추천 출발 시간을 계산할 수 없습니다.',
      });
    }

    const result = await getTravelInfoDetailed({
      from: {
        lat: task.from_lat ?? 0,
        lng: task.from_lng ?? 0,
      },
      to: {
        lat: task.latitude ?? 0,
        lng: task.longitude ?? 0,
      },
      endTime: task.end_time.toISOString(),
      option: task.route_option ?? undefined,
    });

    res.status(200).json({
      success: true,
      message: '경로 정보를 계산하였습니다.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
