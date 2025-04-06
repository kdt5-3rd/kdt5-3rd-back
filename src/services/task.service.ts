import { db } from '../db/db';
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

  const [result] = await db.execute(
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
  const [rows] = await db.execute(
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

  await db.execute(
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
  const [rows] = await db.execute(
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

  await db.execute(
    `DELETE FROM tasks WHERE task_id = ? AND user_id = ?`,
    [taskId, userId]
  );

  return { task_id: taskId, deleted: true };
};

// 📌 일정 완료 처리
export const completeTask = async (userId: number, taskId: number, isCompleted: boolean) => {
  const [rows] = await db.execute('SELECT * FROM tasks WHERE task_id = ? AND user_id = ?', [taskId, userId]);
  if ((rows as any[]).length === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '해당 일정을 찾을 수 없습니다.'
    );
    throw { ...body, status };
  }

  await db.execute('UPDATE tasks SET is_completed = ? WHERE task_id = ?', [isCompleted, taskId]);
};

// 📌 일정 미루기 처리
export const postponeTask = async (userId: number, taskId: number, days: number) => {
  const [rows] = await db.execute('SELECT * FROM tasks WHERE task_id = ? AND user_id = ?', [taskId, userId]);
  if ((rows as any[]).length === 0) {
    const { status, body } = errorResponse(
      ERROR_CODES.NOT_FOUND,
      '해당 일정을 찾을 수 없습니다.'
    );
    throw { ...body, status };
  }

  const task = (rows as any)[0];
  const newStart = new Date(task.start_time);
  newStart.setDate(newStart.getDate() + days);

  let newEnd = null;
  if (task.end_time) {
    newEnd = new Date(task.end_time);
    newEnd.setDate(newEnd.getDate() + days);
  }

  await db.execute(
    'UPDATE tasks SET start_time = ?, end_time = ? WHERE task_id = ?',
    [newStart, newEnd, taskId]
  );
};