// npm run dev 실행을 위한 임시 DB MOCK 파일
export const db = {
  execute: async (..._args: any[]) => {
    return [{}]; // DB 응답처럼 흉내내기
  },
};
