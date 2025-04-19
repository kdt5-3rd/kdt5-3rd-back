import { dbconnect } from '../db/db';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';

interface TaskData {
  title: string;
  memo?: string;
  start_time: string;
  end_time?: string;
  address?: string;
  place_name?: string;
  latitude?: number;
  longitude?: number;
}

// boolean 값 검사기
export const parseToBoolean = (value: any): boolean => {
  // 값이 이미 true 또는 false인 진짜 boolean 타입이라면 그대로 반환
  if (typeof value === 'boolean') return value;

  // 값이 "true" 또는 "false"인 문자열일 경우 → 소문자로 변환한 뒤 비교
  // 대소문자 혼용 ("TRUE", "False")도 허용
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }

  // 그 외 숫자/문자/기타 → Number() 변환 후 Boolean() 처리
  // Number(value)로 숫자 변환 → 0이면 false, 0이 아니면 true
  // 그 결과를 Boolean(...)으로 다시 감싸서 명확하게 true/false 반환하도록..
  return Boolean(Number(value));
}

// 📌 일정 등록
export const createTask = async (userId: number, data: TaskData) => {
  if (!data.title || !data.start_time) {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      '일정 제목과 시작 시간은 필수입니다.',
      { fields: ['title', 'start_time'] }
    );
    throw { ...body, status };
  }

  const [result] = await dbconnect.execute(
    `INSERT INTO tasks (user_id, title, memo, start_time, end_time, address, place_name, latitude, longitude, is_completed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.title,
      data.memo,
      data.start_time,
      data.end_time,
      data.address,
      data.place_name,
      data.latitude,
      data.longitude,
      false,
    ]
  );

  return {
    task_id: (result as any).insertId,
  };
};

// 📌 일정 수정
export const updateTask = async (userId: number, taskId: number, data: any) => {
  if (!data.title || !data.start_time) {
    const { status, body } = errorResponse(
      ERROR_CODES.INVALID_PARAM,
      '일정 제목과 시작 시간은 필수입니다.',
      { fields: ['title', 'start_time'] }
    );
    throw { ...body, status };
  }

  // 필드 추출 (task_id, created_at, updated_at은 무시)
  const {
    title,
    memo,
    start_time,
    end_time,
    address,
    place_name,
    latitude,
    longitude,
    is_completed,
  } = data;

  let query = `
    UPDATE tasks 
    SET title = ?, memo = ?, start_time = ?, end_time = ?, 
        address = ?, place_name = ?, latitude = ?, longitude = ?`;

  const params: any[] = [
    title,
    memo,
    start_time,
    end_time,
    address,
    place_name,
    latitude,
    longitude,
  ];

  if (is_completed !== undefined) {
    query += `, is_completed = ?`;
    params.push(parseToBoolean(is_completed));
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
export const getTasksByDay = async (userId: number, query: any) => {
  const { year, month, day } = query;

  const start = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0));
  const end = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1, 0, 0, 0));

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, start, end]
  );

  // if ((rows as any[]).length === 0) {
  //   const { status, body } = errorResponse(
  //     ERROR_CODES.NOT_FOUND,
  //     '해당 날짜의 일정을 찾을 수 없습니다.'
  //   );
  //   throw { ...body, status };
  // }

  return rows;
};

// 📆 주간 일정 조회
export const getTasksByWeek = async (userId: number, query: any) => {
  const { year, month, week } = query;

  const firstDayOfMonth = new Date(Number(year), Number(month) - 1, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)

  const offset = (week - 1) * 7;
  const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1 + offset - firstDayWeekday, 0, 0, 0));
  const endDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1 + offset - firstDayWeekday + 7, 0, 0, 0));

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, startDate, endDate]
  );

  // if ((rows as any[]).length === 0) {
  //   const { status, body } = errorResponse(
  //     ERROR_CODES.NOT_FOUND,
  //     '해당 주간의 일정을 찾을 수 없습니다.'
  //   );
  //   throw { ...body, status };
  // }

  return rows;
};

// 📌 일정 조회 (월간)
export const getTasksByMonth = async (userId: number, query: any) => {
  const { year, month } = query;

  const start = new Date(Date.UTC(Number(year), Number(month) - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(Number(year), Number(month), 1, 0, 0, 0));

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, start, end]
  );

  // if ((rows as any[]).length === 0) {
  //   const { status, body } = errorResponse(
  //     ERROR_CODES.NOT_FOUND,
  //     '해당 월의 일정을 찾을 수 없습니다.'
  //   );
  //   throw { ...body, status };
  // }

  return rows;
};
