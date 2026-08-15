import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { UserBadgeComponent } from './user-badge.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UserBadgeComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  public username: string | null = null;
  public email: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.username = this.auth.username;
    this.email = this.auth.email;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
