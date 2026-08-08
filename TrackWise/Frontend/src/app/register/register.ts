import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../shared/auth.service';
import { AuthResponse } from '../shared/model/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  public submitting = false;
  public submitted = false;
  public showPassword = false;
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
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatchValidator });

  }

  private passwordsMatchValidator(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordsMismatch: true } : null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || this.submitting || this.form.hasError('passwordsMismatch')) return;

    this.errorMessage = '';
    this.submitting = true;
    const { username, email, country, password } = this.form.value;

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

  private handleSuccess(res: AuthResponse): void {
    this.auth.saveSession(res);
    this.router.navigate(['/']);
  }
}
