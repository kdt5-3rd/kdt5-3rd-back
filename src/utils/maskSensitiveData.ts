const SENSITIVE_KEYS = ['password', 'password_hash', 'token', 'accessToken', 'refreshToken', 'secret'];

export const maskSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;

  // 객체 복사본 생성 (원본 훼손 방지)
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in clone) {
    if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = maskSensitiveData(clone[key]); // 재귀 호출
    } else if (SENSITIVE_KEYS.includes(key)) {
      clone[key] = '***MASKED***'; // 민감 정보 마스킹
    }
  }

  return clone;
};
