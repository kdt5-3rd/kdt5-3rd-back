import { z } from 'zod';

// 📌 좌표값 변환 ("" → undefined)
export const normalizeCoord = (value: any): number | undefined => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

// 📌 KST 기준 현재 시간 반환
export const getCurrentKST = (): string => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(now.getTime() + kstOffset).toISOString().slice(0, 19).replace('T', ' ');
};

// 📌 travel option 유효성 검사 및 정리
const VALID_ROUTE_OPTIONS = [
  'trafast', 'tracomfort', 'traoptimal', 'traavoidtoll', 'traavoidcaronly',
];

export const getValidRouteOption = (option?: string) => {
  const trimmed = option?.trim();
  return VALID_ROUTE_OPTIONS.includes(trimmed || '') ? trimmed : 'trafast';
};

// 📌 실제 달력 날짜 유효성 검사 함수
const isValidDate = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// 📌 문자열 → 숫자 변환 헬퍼
const toNumber = (value: any) => {
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return value;
};

// 📌 task 등록/수정 요청용 스키마
export const TaskBodySchema = z.object({
  title: z.string().min(1, { message: 'title은 필수입니다.' }).max(255, { message: 'title은 최대 255자입니다.' }),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'start_time은 유효한 날짜 문자열이어야 합니다.' }),
  end_time: z.string().optional().refine((val) => val === undefined || !isNaN(Date.parse(val)), { message: 'end_time은 유효한 날짜 문자열이어야 합니다.' }),
  memo: z.string().optional(),
  address: z.string().optional(),
  place_name: z.string().optional(),
  latitude: z.preprocess(normalizeCoord, z.number({ invalid_type_error: '위도는 숫자여야 합니다.' }).min(-90, { message: '위도는 -90 이상이어야 합니다.' }).max(90, { message: '위도는 90 이하여야 합니다.' }).optional()),
  longitude: z.preprocess(normalizeCoord, z.number({ invalid_type_error: '경도는 숫자여야 합니다.' }).min(-180, { message: '경도는 -180 이상이어야 합니다.' }).max(180, { message: '경도는 180 이하여야 합니다.' }).optional()),
  from_lat: z.preprocess(normalizeCoord, z.number({ invalid_type_error: '출발지 위도는 숫자여야 합니다.' }).min(-90, { message: '출발지 위도는 -90 이상이어야 합니다.' }).max(90, { message: '출발지 위도는 90 이하여야 합니다.' }).optional()),
  from_lng: z.preprocess(normalizeCoord, z.number({ invalid_type_error: '출발지 경도는 숫자여야 합니다.' }).min(-180, { message: '출발지 경도는 -180 이상이어야 합니다.' }).max(180, { message: '출발지 경도는 180 이하여야 합니다.' }).optional()),
  from_address: z.string().optional(),
  from_place_name: z.string().optional(),
  route_option: z.string().optional(),
  is_completed: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      if (val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'false') return false;
    }
    return Boolean(Number(val));
  }, z.boolean().optional()),
}).superRefine((data, ctx) => {
  // ✅ 1. start_time과 end_time 검사
  const start = Date.parse(data.start_time);
  let end: number;

  if (!data.end_time) {
    data.end_time = data.start_time;
    end = start;
  } else {
    end = Date.parse(data.end_time);
  }

  if (start > end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end_time'],
      message: 'end_time은 start_time과 같거나 이후여야 합니다.',
    });
  }

  // ✅ 2. 출발지 ↔ 목적지 정보 자동 채우기
  const hasFrom = data.from_lat !== undefined && data.from_lng !== undefined;
  const hasTo = data.latitude !== undefined && data.longitude !== undefined;

  if (hasFrom && !hasTo) {
    data.latitude = data.from_lat;
    data.longitude = data.from_lng;
    data.address = data.from_address;
    data.place_name = data.from_place_name;
  }

  if (!hasFrom && hasTo) {
    data.from_lat = data.latitude;
    data.from_lng = data.longitude;
    data.from_address = data.address;
    data.from_place_name = data.place_name;
  }

  // ✅ 3. 출발지 좌표 세트 검사
  const hasFromLat = data.from_lat !== undefined;
  const hasFromLng = data.from_lng !== undefined;

  if (hasFromLat !== hasFromLng) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasFromLat ? ['from_lng'] : ['from_lat'],
      message: '출발지 위도와 경도는 둘 다 입력하거나 둘 다 생략되어야 합니다.',
    });
  }

  // ✅ 4. 목적지 좌표 세트 검사
  const hasLat = data.latitude !== undefined;
  const hasLng = data.longitude !== undefined;

  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: hasLat ? ['longitude'] : ['latitude'],
      message: '목적지 위도와 경도는 둘 다 입력하거나 둘 다 생략되어야 합니다.',
    });
  }
});

export type TaskBodyInput = z.infer<typeof TaskBodySchema>;

// 📌 일간 조회용 쿼리 스키마
export const DayQuerySchema = z.object({
  year: z.preprocess(toNumber, z.number().int().gte(1000, { message: 'year는 4자리 숫자여야 합니다.' }).lte(9999)),
  month: z.preprocess(toNumber, z.number().int().gte(1, { message: 'month는 1 이상이어야 합니다.' }).lte(12, { message: 'month는 12 이하여야 합니다.' })),
  day: z.preprocess(toNumber, z.number().int().gte(1, { message: 'day는 1 이상이어야 합니다.' }).lte(31, { message: 'day는 31 이하여야 합니다.' })),
}).refine((data) => {
  return isValidDate(data.year, data.month, data.day);
}, {
  message: '올바른 날짜 조합이 아닙니다. (예: 2월 30일은 존재하지 않습니다)',
});

export type DayQueryInput = z.infer<typeof DayQuerySchema>;

// 📌 주간 조회용 쿼리 스키마
export const WeekQuerySchema = z.object({
  year: z.preprocess(toNumber, z.number().int().gte(1000, { message: 'year는 4자리 숫자여야 합니다.' }).lte(9999)),
  month: z.preprocess(toNumber, z.number().int().gte(1, { message: 'month는 1 이상이어야 합니다.' }).lte(12, { message: 'month는 12 이하여야 합니다.' })),
  week: z.preprocess(toNumber, z.number().int().gte(1, { message: 'week는 1 이상이어야 합니다.' }).lte(6, { message: 'week는 6 이하여야 합니다.' })),
});

export type WeekQueryInput = z.infer<typeof WeekQuerySchema>;

// 📌 월간 조회용 쿼리 스키마
export const MonthQuerySchema = z.object({
  year: z.preprocess(toNumber, z.number().int().gte(1000, { message: 'year는 4자리 숫자여야 합니다.' }).lte(9999)),
  month: z.preprocess(toNumber, z.number().int().gte(1, { message: 'month는 1 이상이어야 합니다.' }).lte(12, { message: 'month는 12 이하여야 합니다.' })),
});

export type MonthQueryInput = z.infer<typeof MonthQuerySchema>;

// 📌 DB 조회 후 좌표값 처리용
export const parseDecimalFields = (row: any) => {
  return {
    ...row,
    latitude: row.latitude !== null ? parseFloat(row.latitude) : null,
    longitude: row.longitude !== null ? parseFloat(row.longitude) : null,
    from_lat: row.from_lat !== null ? parseFloat(row.from_lat) : null,
    from_lng: row.from_lng !== null ? parseFloat(row.from_lng) : null,
  };
};
