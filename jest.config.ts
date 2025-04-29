import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // tests 폴더 내 *.test.ts 파일 대상으로 테스트
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};

export default config;
