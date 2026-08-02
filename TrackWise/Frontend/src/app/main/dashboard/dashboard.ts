import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <h4 class="card-title mb-3">Dashboard</h4>
        <p class="text-muted mb-0">Welcome to your expense dashboard.</p>
      </div>
    </div>
  `,
})
export class DashboardComponent {}
