export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
