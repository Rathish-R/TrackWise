import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  constructor(private auth: AuthService, private router: Router) {}

  get username(): string | null {
    return this.auth.username;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
