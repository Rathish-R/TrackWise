import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  template: `
    <div class="ms-auto">
      <div class="d-inline-block dropdown">
        <button
          class="btn p-0 bg-transparent border-0"
          type="button"
          id="userMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div style="width:44px;height:44px;border-radius:50%;background:var(--bs-primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:18px;">
            {{ initials }}
          </div>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
          <li class="px-3 py-2">
            <strong>{{ username }}</strong>
            <div class="text-muted small">Signed in</div>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li class="dropdown-item-text">
            <div><strong>User Details</strong></div>
            <div class="small text-muted">Email: {{ email }}</div>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <button class="dropdown-item text-danger" type="button" (click)="onLogout()">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class UserBadgeComponent {
  @Input() username: string | null = null;
  @Input() email: string | null = null;
  @Output() logout = new EventEmitter<void>();

  get initials(): string {
    if (!this.username) return '';
    const parts = this.username.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
