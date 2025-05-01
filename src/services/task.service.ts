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
import dayjs from 'dayjs';

const prisma = new PrismaClient();

const toKst = (date: Date | null) => {
  return date ? new Date(date.getTime() + 9 * 60 * 60 * 1000) : null;
};

// 📌 일정 등록
export const createTask = async (userId: number, data: TaskBodyInput) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option,
  } = data;

  // 출발지 또는 도착지 정보가 누락된 경우: 의미 없는 좌표값 (ex. 0, 0)
  const hasValidCoords =
    !!latitude && !!longitude && !!from_lat && !!from_lng &&
    (latitude !== 0 || longitude !== 0 || from_lat !== 0 || from_lng !== 0);

  let travel = null;
  if (hasValidCoords) {
    try {
      travel = await getTravelInfoDetailed({
        from: { lat: from_lat!, lng: from_lng! },
        to: { lat: latitude!, lng: longitude! },
        endTime: end_time!,
        option: getValidRouteOption(route_option),
      });
    } catch (err) {
      // 로그로만 남기고 진행 (에러 방지 목적)
      console.error('경로 계산 실패:', err);
    }
  }

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
      recommended_departure_time: travel?.recommended_departure_time
        ? new Date(travel.recommended_departure_time)
        : null,
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

  // 출발지 또는 도착지 정보가 누락된 경우: 의미 없는 좌표값 (ex. 0, 0)
  const hasValidCoords =
    !!latitude && !!longitude && !!from_lat && !!from_lng &&
    (latitude !== 0 || longitude !== 0 || from_lat !== 0 || from_lng !== 0);

  let travel = null;
  if (hasValidCoords) {
    try {
      travel = await getTravelInfoDetailed({
        from: { lat: from_lat!, lng: from_lng! },
        to: { lat: latitude!, lng: longitude! },
        option: getValidRouteOption(route_option),
        endTime: end_time!,
      }); 
    } catch (err) {
      // 로그로만 남기고 진행 (에러 방지 목적)
      console.error('경로 계산 실패:', err);
    }
  }

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

  // KST 기준 0시 → UTC로 변환
  const kstStart = dayjs.tz(`${year}-${month}-${day} 00:00:00`, 'Asia/Seoul').utc().toDate();
  const kstEnd = dayjs.tz(`${year}-${month}-${day} 23:59:59`, 'Asia/Seoul').utc().toDate();

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
      start_time: {
        gte: kstStart,
        lt: kstEnd,
      },
    },
  });

  // 응답 가공: 경로 정보가 없을 경우 메시지 처리, 나머지 컬럼은 그대로 반환
  return tasks.map((task) => ({
    ...task,
    start_time: toKst(task.start_time),
    end_time: toKst(task.end_time),
    travel_duration: task.travel_duration ?? '경로 정보 없음',
    travel_distance: task.travel_distance ?? '경로 정보 없음',
    recommended_departure_time: task.recommended_departure_time
      ? task.recommended_departure_time.toISOString()
      : '경로 정보 없음',
  }));
};

// 📆 주간 일정 조회
export const getTasksByWeek = async (userId: number, query: WeekQueryInput) => {
  const { year, month, week } = query;

  const weekStartDate = (week - 1) * 7 + 1;

  const kstStart = dayjs.tz(`${year}-${month}-${weekStartDate} 00:00:00`, 'Asia/Seoul').utc().toDate();
  const kstEnd = dayjs(kstStart).add(7, 'day').toDate();

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
      start_time: {
        gte: kstStart,
        lt: kstEnd,
      },
    },
  });

  return tasks.map((task) => ({
    ...task,
    start_time: toKst(task.start_time),
    end_time: toKst(task.end_time),
    recommended_departure_time: task.recommended_departure_time
      ? toKst(task.recommended_departure_time)
      : '경로 정보 없음',
    travel_duration: task.travel_duration ?? '경로 정보 없음',
    travel_distance: task.travel_distance ?? '경로 정보 없음',
  }));
};

// 📅 월간 일정 조회
export const getTasksByMonth = async (userId: number, query: MonthQueryInput) => {
  const { year, month } = query;

  const kstStart = dayjs.tz(`${year}-${month}-01 00:00:00`, 'Asia/Seoul').utc().toDate();
  const kstEnd = dayjs(kstStart).add(1, 'month').toDate();

  const tasks = await prisma.task.findMany({
    where: {
      user_id: userId,
      start_time: {
        gte: kstStart,
        lt: kstEnd,
      },
    },
  });

  return tasks.map((task) => ({
    ...task,
    start_time: toKst(task.start_time),
    end_time: toKst(task.end_time),
    recommended_departure_time: task.recommended_departure_time
      ? toKst(task.recommended_departure_time)
      : '경로 정보 없음',
    travel_duration: task.travel_duration ?? '경로 정보 없음',
    travel_distance: task.travel_distance ?? '경로 정보 없음',
  }));
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
