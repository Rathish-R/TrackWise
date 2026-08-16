import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { AuthResponse } from '../shared/model/auth';
import { COUNTRIES } from '../shared/model/countries';

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

  public countries = COUNTRIES;

  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
    const selectedCountry = country as { name: string; currency: string } | null;

    this.auth.register({
      username,
      email,
      country: selectedCountry?.name ?? null,
      currency: selectedCountry?.currency ?? null,
      password,
    })
      .pipe(finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: AuthResponse) => this.handleSuccess(res),
        error: (err: any) => {
          this.errorMessage = this.auth.getErrorMessage(err);
        },
      });
  }

  private handleSuccess(res: AuthResponse): void {
    this.auth.saveSession(res);
    this.router.navigate(['/']);
  }
}
