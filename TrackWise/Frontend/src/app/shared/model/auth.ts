export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  country?: string | null;
  password: string;
}
