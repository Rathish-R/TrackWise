import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { AuthResponse, RegisterRequest } from './model/auth';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string,
    private session: SessionService,
  ) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/api/Auth/login', { username, password });
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/api/Auth/register', payload);
  }

  saveSession(auth: AuthResponse): void {
    this.session.setSession({
      token: auth.token,
      userId: auth.userId,
      username: auth.username,
      email: auth.email,
    });
  }

  logout(): void {
    this.session.clear();
  }

  get token(): string | null {
    return this.session.token;
  }

  get userId(): number {
    return this.session.userId;
  }

  get username(): string | null {
    return this.session.username;
  }

  get email(): string | null {
    return this.session.email;
  }

  get isAuthenticated(): boolean {
    return this.session.isAuthenticated;
  }
}
