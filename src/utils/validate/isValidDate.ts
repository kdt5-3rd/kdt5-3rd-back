/**
 * 주어진 연, 월, 일 조합이 실제로 존재하는 날짜인지 확인하는 함수입니다.
 * 
 * 📌 검사 원리:
 * JS의 Date 객체는 잘못된 날짜도 자동으로 보정합니다.
 * 예: new Date(2025, 1, 31) → 2025-03-02 (자동 보정됨)
 * 
 * 따라서 입력값 그대로 Date를 만들고, 다시 해당 연/월/일과 비교해서
 * 입력값과 일치하는 날짜가 실제로 존재하는지 확인해야 합니다.
 * 
 * @param year - 4자리 연도 (예: 2025)
 * @param month - 월 (1~12)
 * @param day - 일 (1~31)
 * @returns boolean - 실제 존재하는 날짜면 true, 아니면 false
 */
export const isValidDate = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month - 1, day); // JS는 month가 0부터 시작하므로 -1 필요
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };
  