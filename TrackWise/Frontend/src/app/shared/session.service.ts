import { Injectable } from '@angular/core';
import { Session } from './model/session';

const SESSION_KEY = 'trackwise_session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private session: Session | null = this.load();

  setSession(session: Session): void {
    this.session = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    this.session = null;
    localStorage.removeItem(SESSION_KEY);
  }

  get value(): Session | null {
    return this.session;
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  // Always return a number; 0 indicates no authenticated user
  get userId(): number {
    return this.session?.userId ?? 0;
  }

  get username(): string | null {
    return this.session?.username ?? null;
  }

  get email(): string | null {
    return this.session?.email ?? null;
  }

  get currency(): string {
    return this.session?.currency || '$';
  }

  get country(): string | null {
    return this.session?.country ?? null;
  }

  get isAuthenticated(): boolean {
    return !!this.session;
  }

  private load(): Session | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
