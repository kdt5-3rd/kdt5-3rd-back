import { errorResponse } from '../utils/errorResponse';
import { ERROR_CODES } from '../constants/errorCodes';

const mockUserDB = ['test@example.com'];

export const pingService = async (): Promise<string> => {
    const now = new Date().toISOString();
    return now;
};

// 에러 처리 예시..
export const registerUser = async (email: string, password: string) => {
    if (!email || !password) {
      const { status, body } = errorResponse(
        ERROR_CODES.INVALID_PARAM,
        '이메일과 비밀번호는 필수입니다.',
        { fields: ['email', 'password'] }
      );
      throw { ...body, status };
    }
  
    if (mockUserDB.includes(email)) {
      const { status, body } = errorResponse(
        ERROR_CODES.CONFLICT,
        '이미 등록된 이메일입니다.',
        { field: 'email' }
      );
      throw { ...body, status };
    }
  
    // 회원가입 처리 생략
    return { email, status: 'created' };
  };