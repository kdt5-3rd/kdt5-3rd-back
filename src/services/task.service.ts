import { DayQueryInput, MonthQueryInput, TaskBodyInput, WeekQueryInput, parseDecimalFields, getCurrentKST, getValidRouteOption } from '../types/task';
import { dbconnect } from '../db/db';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';
import { formatTravelFields } from '../utils/formatTravelFields';
import { getTravelInfoDetailed } from '../utils/getTravelInfoDetailed';

// 📌 일정 등록
export const createTask = async (userId: number, data: TaskBodyInput) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option,
  } = data;

  const createdAt = getCurrentKST();
  const updatedAt = createdAt;

  const travel = await getTravelInfoDetailed({
    from: { lat: from_lat as number, lng: from_lng as number },
    to: { lat: latitude as number, lng: longitude as number },
    option: getValidRouteOption(route_option),
    startTime: start_time,
  });

  const [result] = await dbconnect.execute(
    `INSERT INTO tasks (
      user_id, title, memo, start_time, end_time, address, place_name,
      latitude, longitude, from_lat, from_lng, from_address, from_place_name, route_option,
      travel_duration, travel_distance, recommended_departure_time,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, title, memo, start_time, end_time, address, place_name,
      latitude ?? null, longitude ?? null,
      from_lat ?? null, from_lng ?? null, from_address, from_place_name,
      getValidRouteOption(route_option),
      travel?.duration ?? null, travel?.distance ?? null, travel?.recommended_departure_time ?? null,
      createdAt, updatedAt
    ]
  );

  return { taskId: (result as any).insertId };
};

// 📌 일정 수정
export const updateTask = async (userId: number, taskId: number, data: TaskBodyInput) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option, is_completed
  } = data;

  const updatedAt = getCurrentKST();

  const travel = await getTravelInfoDetailed({
    from: { lat: from_lat as number, lng: from_lng as number },
    to: { lat: latitude as number, lng: longitude as number },
    option: getValidRouteOption(route_option),
    startTime: start_time,
  });

  const params: any[] = [
    title, memo, start_time, end_time,
    address, place_name, latitude, longitude,
    from_lat, from_lng, from_address, from_place_name,
    getValidRouteOption(route_option), updatedAt
  ];

  let travelQuery = '';
  if (travel) {
    travelQuery = ', travel_duration = ?, travel_distance = ?, recommended_departure_time = ?';
    params.push(travel.duration, travel.distance, travel.recommended_departure_time);
  }

  let query = `
    UPDATE tasks
    SET title = ?, memo = ?, start_time = ?, end_time = ?,
        address = ?, place_name = ?, latitude = ?, longitude = ?,
        from_lat = ?, from_lng = ?, from_address = ?, from_place_name = ?,
        route_option = ?, updated_at = ?${travelQuery}`;

  if (is_completed !== undefined) {
    query += `, is_completed = ?`;
    params.push(is_completed);
  }

  query += ` WHERE task_id = ? AND user_id = ?`;
  params.push(taskId, userId);

  await dbconnect.execute(query, params);

  return { task_id: taskId, updated: true };
};

// 📌 일정 삭제
export const deleteTask = async (userId: number, taskId: number) => {
  const [rows] = await dbconnect.execute(
    `SELECT * FROM tasks WHERE task_id = ? AND user_id = ?`,
    [taskId, userId]
  );

  if ((rows as any[]).length === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '삭제할 일정을 찾을 수 없습니다.'
    );
    throw { ...body, status };
  }

  await dbconnect.execute(
    `DELETE FROM tasks WHERE task_id = ? AND user_id = ?`,
    [taskId, userId]
  );

  return { task_id: taskId, deleted: true };
};

// 📅 일간 일정 조회
export const getTasksByDay = async (userId: number, query: DayQueryInput) => {
  const { year, month, day } = query;

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, start, end]
  );

  return (rows as any[]).map(row => formatTravelFields(parseDecimalFields(row)));
};

// 📆 주간 일정 조회
export const getTasksByWeek = async (userId: number, query: WeekQueryInput) => {
  const { year, month, week } = query;
  const baseDate = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(baseDate);
  start.setUTCDate((week - 1) * 7 + 1);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, start, end]
  );

  return (rows as any[]).map(parseDecimalFields);
};

// 📅 월간 일정 조회
export const getTasksByMonth = async (userId: number, query: MonthQueryInput) => {
  const { year, month } = query;

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, start, end]
  );

  return (rows as any[]).map(parseDecimalFields);
};

// 📌 task id 기반 조회
export const getTaskById = async (taskId: number) => {
  const [rows]: any = await dbconnect.execute(
    `SELECT * FROM tasks WHERE task_id = ?`,
    [taskId]
  );

  if (!rows || rows.length === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '해당 일정을 찾을 수 없습니다.'
    );
    throw { ...body, status };
  }

  return rows[0];
};
