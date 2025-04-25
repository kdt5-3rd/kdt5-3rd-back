import { dbconnect } from '../db/db';
import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';
import { formatTravelFields } from '../utils/formatTravelFields';
import { getTravelInfoDetailed } from '../utils/getTravelInfoDetailed';

//
// * 공통 타입
//

export interface TaskData {
  title: string;
  memo?: string;
  start_time: string;
  end_time?: string;
  address?: string;
  place_name?: string;
  latitude?: number;
  longitude?: number;
  from_lat?: number;
  from_lng?: number;
  from_address?: string;
  from_place_name?: string;
  route_option?: string;
}

export interface TravelData {
  duration: number;
  distance: number;
  recommended_departure_time: string;
}

//
// * 공통 유틸 함수
//

// 숫자 파서
export const parseDecimalFields = (row: any) => {
  return {
    ...row,
    latitude: row.latitude !== null ? parseFloat(row.latitude) : null,
    longitude: row.longitude !== null ? parseFloat(row.longitude) : null,
    from_lat: row.from_lat !== null ? parseFloat(row.from_lat) : null,
    from_lng: row.from_lng !== null ? parseFloat(row.from_lng) : null
  };
};

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

// ✅ KST 기준 현재 시간 반환
const getCurrentKST = (): string => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(now.getTime() + kstOffset).toISOString().slice(0, 19).replace('T', ' ');
};

// 공통 유효 좌표 검사 함수
const isValidCoord = (value: any): value is number => {
  if (typeof value === 'string') {
    return !isNaN(+value) && +value !== 0;
  };
  
  return typeof value === 'number' && value !== 0;
};

// travel route_option 제한
const VALID_ROUTE_OPTIONS = [
  'trafast', 'tracomfort', 'traoptimal', 'traavoidtoll', 'traavoidcaronly'
];
const getValidRouteOption = (option?: string) => {
  const trimmed = option?.trim();
  return VALID_ROUTE_OPTIONS.includes(trimmed || '') ? trimmed : 'trafast';
};

// 공통 travel 계산 함수
const computeTravelInfo = async (
  from_lat?: number, from_lng?: number,
  to_lat?: number, to_lng?: number,
  route_option?: string,
  start_time?: string
) => {
  if (
    isValidCoord(from_lat) && isValidCoord(from_lng) &&
    isValidCoord(to_lat) && isValidCoord(to_lng)
  ) {
    try {
      const travelInfo = await getTravelInfoDetailed({
        from: { lat: from_lat as number, lng: from_lng as number },
        to: { lat: to_lat as number, lng: to_lng as number },
        option: getValidRouteOption(route_option),
        startTime: start_time || new Date().toISOString(),
      });

      return {
        travel_duration: travelInfo.duration,
        travel_distance: travelInfo.distance,
        recommended_departure_time: travelInfo.recommended_departure_time,
        route_option: getValidRouteOption(route_option)
      };
    } catch (err) {
      console.error('[Travel 계산 실패]', err);
    }
  }

  return {
    travel_duration: null,
    travel_distance: null,
    recommended_departure_time: null,
    route_option: getValidRouteOption(route_option)
  };
};

//
// * 실제 함수들
//

// 📌 일정 등록
export const createTask = async (userId: number, data: TaskData) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option,
  } = data;

  const createdAt = getCurrentKST();
  const updatedAt = createdAt;

  const travel = await computeTravelInfo(
    from_lat, from_lng, latitude, longitude, route_option, start_time
  );

  const [result] = await dbconnect.execute(
    `INSERT INTO tasks (
      user_id, title, memo, start_time, end_time, address, place_name,
      latitude, longitude, from_lat, from_lng, from_address, from_place_name, route_option,
      travel_duration, travel_distance, recommended_departure_time,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, title, memo, start_time || null, end_time || null, address, place_name,
      latitude ?? null, longitude ?? null,
      from_lat ?? null, from_lng ?? null, from_address, from_place_name,
      travel.route_option,
      travel.travel_duration, travel.travel_distance, travel.recommended_departure_time,
      createdAt, updatedAt
    ]
  );

  return { taskId: (result as any).insertId };
};

// 📌 일정 수정
export const updateTask = async (userId: number, taskId: number, data: any) => {
  const {
    title, memo, start_time, end_time, address, place_name,
    latitude, longitude, from_lat, from_lng,
    from_address, from_place_name, route_option, is_completed
  } = data;

  const updatedAt = getCurrentKST();

  const travel = await computeTravelInfo(
    from_lat, from_lng, latitude, longitude, route_option, start_time
  );

  const params: any[] = [
    title, memo, start_time, end_time,
    address, place_name, latitude, longitude,
    from_lat, from_lng, from_address, from_place_name,
    travel.route_option, updatedAt
  ];

  let travelQuery = '';
  if (travel.travel_duration !== null) {
    travelQuery = ', travel_duration = ?, travel_distance = ?, recommended_departure_time = ?';
    params.push(travel.travel_duration, travel.travel_distance, travel.recommended_departure_time);
  }

  let query = `
    UPDATE tasks 
    SET title = ?, memo = ?, start_time = ?, end_time = ?, 
        address = ?, place_name = ?, latitude = ?, longitude = ?, 
        from_lat = ?, from_lng = ?, from_address = ?, from_place_name = ?, 
        route_option = ?, updated_at = ?${travelQuery}`;

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

  const formatted = (rows as any[]).map((row) =>
    formatTravelFields(parseDecimalFields(row)) // decimal 처리도 함께
  );

  return formatted;
};

// 📆 주간 일정 조회
export const getTasksByWeek = async (userId: number, query: any) => {
  const { year, month, week } = query;
  const baseDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
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
export const getTasksByMonth = async (userId: number, query: any) => {
  const { year, month } = query;
  const start = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  const end = new Date(Date.UTC(Number(year), Number(month), 1));

  const [rows] = await dbconnect.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND start_time >= ? AND start_time < ?',
    [userId, start, end]
  );

  return (rows as any[]).map(parseDecimalFields);
};

// path 계산용 task id 검색
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
