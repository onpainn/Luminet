import 'express';

declare module 'express' {
  interface Request {
    cookies: {
      refreshToken?: string;
    };
  }
}
