/**
 * 문자열이 유효한 ISO 8601 날짜/시간인지 검사
 * 예: "2025-04-22T10:00:00" → true
 */
export const isValidDateTime = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
};
  