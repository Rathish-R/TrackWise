import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { AuthResponse } from '../shared/model/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  public mode: 'login' | 'signup' = 'login';
  public submitting = false;
  public errorMessage = '';

  public countries = [
    'Afghanistan', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium',
    'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Denmark', 'Egypt',
    'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya',
    'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria',
    'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa',
    'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan',
    'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Vietnam',
  ];

  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      country: [''],
      password: ['', Validators.required],
    });
  }

  switchMode(mode: 'login' | 'signup'): void {
    this.mode = mode;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    this.errorMessage = '';
    this.submitting = true;
    const { username, email, country, password } = this.form.value;

    if (this.mode === 'login') {
      this.auth.login(username, password).subscribe({
        next: (res: AuthResponse) => this.handleSuccess(res),
        error: (err: any) => {
          this.submitting = false;
          this.errorMessage =
            err.status === 404
              ? "User doesn't exist. Please sign up."
              : err.status === 401
                ? 'Invalid password.'
                : 'Something went wrong. Please try again.';
        },
      });
    } else {
      this.auth.register({ username, email, country, password }).subscribe({
        next: (res: AuthResponse) => this.handleSuccess(res),
        error: (err: any) => {
          this.submitting = false;
          this.errorMessage =
            err.status === 409
              ? (err.error?.message ?? 'User already exists.')
              : 'Something went wrong. Please try again.';
        },
      });
    }
  }

  private handleSuccess(res: AuthResponse): void {
    this.auth.saveSession(res);
    this.router.navigate(['/']);
  }
}
