export interface ErrorCode {
    code: string;
    status: number;
    message: string;
}
  
export const ERROR_CODES: Record<string, ErrorCode> = {
    INVALID_PARAM: {
      code: 'ERR_INVALID_PARAM',
      status: 400,
      message: '요청 파라미터가 유효하지 않습니다.',
    },
    UNAUTHORIZED: {
      code: 'ERR_UNAUTHORIZED',
      status: 401,
      message: '인증이 필요합니다.',
    },
    FORBIDDEN: {
      code: 'ERR_FORBIDDEN',
      status: 403,
      message: '권한이 없습니다.',
    },
    NOT_FOUND: {
      code: 'ERR_NOT_FOUND',
      status: 404,
      message: '요청한 리소스를 찾을 수 없습니다.',
    },
    CONFLICT: {
      code: 'ERR_CONFLICT',
      status: 409,
      message: '이미 존재하는 자원입니다.',
    },
    INTERNAL: {
      code: 'ERR_INTERNAL_SERVER',
      status: 500,
      message: '서버 내부 오류가 발생했습니다.',
    },
};
  