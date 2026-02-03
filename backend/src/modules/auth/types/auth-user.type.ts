export type AuthUser = {
  id: number;
  email: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
