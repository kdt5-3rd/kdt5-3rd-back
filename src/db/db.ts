import mysql from 'mysql2/promise';

export const dbconnect = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// npm run dev 실행을 위한 임시 DB MOCK 파일
export const db = {
    execute: async (..._args: any[]) => {
      return [{}]; // DB 응답처럼 흉내내기
    },
};
