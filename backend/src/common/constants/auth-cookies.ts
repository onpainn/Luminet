export const REFRESH_COOKIE = 'refresh_token';

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // ⚠️ true в prod (https)
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
};
