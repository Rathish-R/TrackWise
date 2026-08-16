import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { AuthResponse, AuthProfile, RegisterRequest, UpdateProfileRequest } from './model/auth';
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

  getProfile(): Observable<AuthProfile> {
    return this.http.get<AuthProfile>(this.baseUrl + '/api/Auth/me');
  }

  updateProfile(payload: UpdateProfileRequest): Observable<AuthProfile> {
    return this.http.put<AuthProfile>(this.baseUrl + '/api/Auth/me', payload).pipe(
      tap((profile) => {
        const current = this.session.value;
        if (current) {
          this.session.setSession({
            ...current,
            country: profile.country,
            currency: profile.currency,
          });
        }
      }),
    );
  }

  getErrorMessage(error: any): string {
    const payload = error?.error ?? {};

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (payload && typeof payload.errors === 'object') {
      const messages = Object.values(payload.errors)
        .flatMap((value: unknown) => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    switch (error?.status) {
      case 400:
        return payload?.title ?? 'Validation failed. Please check your input.';
      case 401:
        return 'Invalid password.';
      case 404:
        return "User doesn't exist. Please sign up.";
      case 409:
        return payload?.message ?? 'User already exists.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  saveSession(auth: AuthResponse): void {
    this.session.setSession({
      token: auth.token,
      userId: auth.userId,
      username: auth.username,
      email: auth.email,
      country: auth.country,
      currency: auth.currency,
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

  get currency(): string {
    return this.session.currency || '$';
  }

  get country(): string | null {
    return this.session.country ?? null;
  }

  get isAuthenticated(): boolean {
    return this.session.isAuthenticated;
  }
}
