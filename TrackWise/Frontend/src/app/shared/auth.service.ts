import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { AuthResponse, RegisterRequest } from './model/auth';

const TOKEN_KEY = 'trackwise_token';
const USER_ID_KEY = 'trackwise_userId';
const USERNAME_KEY = 'trackwise_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/api/Auth/login', { username, password });
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/api/Auth/register', payload);
  }

  saveSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_ID_KEY, auth.userId);
    localStorage.setItem(USERNAME_KEY, auth.username);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get userId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }

  get username(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }
}
