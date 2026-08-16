import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../shared/auth.service';
import { AuthResponse } from '../shared/model/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  public submitting = false;
  public submitted = false;
  public showPassword = false;
  public errorMessage = '';

  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || this.submitting) return;

    this.errorMessage = '';
    this.submitting = true;
    const { username, password } = this.form.value;

    this.auth.login(username, password)
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
