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
    `INSERT INTO tasks (user_id, title, memo, start_time, end_time, address, place_name, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.title,
      data.memo || null,
      data.start_time,
      data.end_time || null,
      data.address || null,
      data.place_name || null,
      data.latitude || null,
      data.longitude || null,
    ]
  );

  const insertId = (result as any).insertId;
  return { task_id: insertId };
};

// 📌 일정 수정
export const updateTask = async (userId: number, taskId: number, data: TaskData) => {
  const [rows] = await dbconnect.execute(
    `SELECT * FROM tasks WHERE task_id = ? AND user_id = ?`,
    [taskId, userId]
  );

  if ((rows as any[]).length === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '해당 일정을 찾을 수 없습니다.'
    );
    throw { ...body, status };
  }

  await dbconnect.execute(
    `UPDATE tasks SET title = ?, memo = ?, start_time = ?, end_time = ?, address = ?, place_name = ?, latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
     WHERE task_id = ? AND user_id = ?`,
    [
      data.title,
      data.memo || null,
      data.start_time,
      data.end_time || null,
      data.address || null,
      data.place_name || null,
      data.latitude || null,
      data.longitude || null,
      taskId,
      userId,
    ]
  );

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
