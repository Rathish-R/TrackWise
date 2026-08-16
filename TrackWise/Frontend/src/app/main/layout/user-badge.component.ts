import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize } from 'rxjs';
import { AuthService } from '../../shared/auth.service';
import { COUNTRIES } from '../../shared/model/countries';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule],
  templateUrl: './user-badge.component.html',
  styleUrl: './user-badge.component.css',
})
export class UserBadgeComponent {
  @Input() username: string | null = null;
  @Input() email: string | null = null;
  @Output() logout = new EventEmitter<void>();

  public countries = COUNTRIES;
  public showEditModal = false;
  public isSaving = false;
  public errorMessage = '';
  public profileForm: FormGroup;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      country: [null],
      currency: ['', Validators.required],
    });
  }

  get country(): string | null {
    return this.auth.country;
  }

  get currency(): string {
    return this.auth.currency;
  }

  get initials(): string {
    if (!this.username) return '';
    const parts = this.username.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  openEditModal(): void {
    const countryObj = this.country
      ? this.countries.find((c) => c.name === this.country) ?? null
      : null;
    this.profileForm.setValue({
      username: this.username ?? '',
      email: this.email ?? '',
      country: countryObj,
      currency: this.currency,
    });
    this.errorMessage = '';
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  onCountryChange(): void {
    const selected = this.profileForm.get('country')?.value as
      | { name: string; currency: string }
      | null;
    if (selected?.currency) {
      this.profileForm.get('currency')?.setValue(selected.currency);
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.cdr.detectChanges();
  }

  onSave(): void {
    if (this.isSaving) return;

    const value = this.profileForm.value;
    const selectedCountry = value.country as { name: string; currency: string } | null;

    this.isSaving = true;
    this.errorMessage = '';
    this.auth
      .updateProfile({
        country: selectedCountry?.name ?? null,
        currency: value.currency || '$',
      })
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showEditModal = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = this.auth.getErrorMessage(err);
          this.cdr.detectChanges();
        },
      });
  }

  onLogout(): void {
    this.logout.emit();
  }
}
