import { PrismaClient } from '@prisma/client';
import {
  DayQueryInput,
  MonthQueryInput,
  TaskBodyInput,
  WeekQueryInput,
  getValidRouteOption,
} from '../types/task';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';
import { getTravelInfoDetailed } from '../utils/getTravelInfoDetailed';

const prisma = new PrismaClient();

// 📌 일정 등록
export const createTask = async (userId: number, data: TaskBodyInput) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option,
  } = data;

  const travel = await getTravelInfoDetailed({
    from: { lat: from_lat!, lng: from_lng! },
    to: { lat: latitude!, lng: longitude! },
    option: getValidRouteOption(route_option),
    startTime: start_time,
  });

  const task = await prisma.task.create({
    data: {
      user_id: userId,
      title,
      memo,
      start_time: new Date(start_time),
      end_time: end_time ? new Date(end_time) : null,
      address,
      place_name,
      latitude,
      longitude,
      from_lat,
      from_lng,
      from_address,
      from_place_name,
      route_option: getValidRouteOption(route_option),
      travel_duration: travel?.duration ?? null,
      travel_distance: travel?.distance ?? null,
      recommended_departure_time: travel?.recommended_departure_time ? new Date(travel.recommended_departure_time) : null,
      // is_completed, created_at, updated_at은 자동 처리
    },
  });

  return { taskId: task.task_id };
};

// 📌 일정 수정
export const updateTask = async (userId: number, taskId: number, data: TaskBodyInput) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option, is_completed,
  } = data;

  const travel = await getTravelInfoDetailed({
    from: { lat: from_lat!, lng: from_lng! },
    to: { lat: latitude!, lng: longitude! },
    option: getValidRouteOption(route_option),
    startTime: start_time,
  });

  const updateData: any = {
    title,
    memo,
    start_time: new Date(start_time),
    end_time: end_time ? new Date(end_time) : null,
    address,
    place_name,
    latitude,
    longitude,
    from_lat,
    from_lng,
    from_address,
    from_place_name,
    route_option: getValidRouteOption(route_option),
    updated_at: new Date(), // Prisma는 updated_at을 자동 업데이트하지만 명시적으로 처리
  };

  if (travel) {
    updateData.travel_duration = travel.duration;
    updateData.travel_distance = travel.distance;
    updateData.recommended_departure_time = travel.recommended_departure_time ? new Date(travel.recommended_departure_time) : null;
  }

  if (is_completed !== undefined) {
    updateData.is_completed = is_completed;
  }

  const updatedTask = await prisma.task.updateMany({
    where: {
      task_id: taskId,
      user_id: userId,
    },
    data: updateData,
  });

  if (updatedTask.count === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '수정할 일정을 찾을 수 없습니다.',
    );
    throw { ...body, status };
  }

  return { taskId, updated: true };
};

// 📌 일정 삭제
export const deleteTask = async (userId: number, taskId: number) => {
  const deleted = await prisma.task.deleteMany({
    where: {
      task_id: taskId,
      user_id: userId,
    },
  });

  if (deleted.count === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '삭제할 일정을 찾을 수 없습니다.',
    );
    throw { ...body, status };
  }

  return { taskId, deleted: true };
};

// 📅 일간 일정 조회
export const getTasksByDay = async (userId: number, query: DayQueryInput) => {
  const { year, month, day } = query;

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
      start_time: {
        gte: start,
        lt: end,
      },
    },
  });

  return tasks;
};

// 📆 주간 일정 조회
export const getTasksByWeek = async (userId: number, query: WeekQueryInput) => {
  const { year, month, week } = query;

  const baseDate = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(baseDate);
  start.setUTCDate((week - 1) * 7 + 1);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
      start_time: {
        gte: start,
        lt: end,
      },
    },
  });

  return tasks;
};

// 📅 월간 일정 조회
export const getTasksByMonth = async (userId: number, query: MonthQueryInput) => {
  const { year, month } = query;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
      start_time: {
        gte: start,
        lt: end,
      },
    },
  });

  return tasks;
};

// 📌 task id 기반 조회
export const getTaskById = async (taskId: number) => {
  const task = await prisma.task.findUnique({
    where: {
      task_id: taskId,
    },
  });

  if (!task) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '해당 일정을 찾을 수 없습니다.',
    );
    throw { ...body, status };
  }

  return task;
};
