export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  country: string | null;
  currency: string;
}

export interface AuthProfile {
  username: string;
  email: string;
  country: string | null;
  currency: string;
}

export interface UpdateProfileRequest {
  country?: string | null;
  currency?: string | null;
}

export interface RegisterRequest {
  username: string;
  email: string;
  country?: string | null;
  currency?: string | null;
  password: string;
}
