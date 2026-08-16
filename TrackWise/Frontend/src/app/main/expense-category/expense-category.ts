import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../shared/category.service';
import { Category } from '../../shared/model/category';
import { ColorHelper } from './color-helper';

@Component({
  selector: 'app-expense-category',
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './expense-category.html',
  styleUrl: './expense-category.css',
})
export class ExpenseCategoryComponent implements OnInit {
  public categories: Category[] = [];
  public isLoading = false;
  public showAddModal = false;
  public isSaving = false;
  public categoryForm: FormGroup;

  public iconOptions: string[] = [
    'bi-cup-hot',
    'bi-car-front',
    'bi-lightning',
    'bi-bag',
    'bi-heart-pulse',
    'bi-house-door',
    'bi-film',
    'bi-mortarboard',
    'bi-controller',
    'bi-activity',
    'bi-wifi',
    'bi-phone',
    'bi-cash-coin',
    'bi-gift',
    'bi-three-dots',
  ];

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
      icon: ['bi-three-dots'],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.categoryService.list().subscribe({
      next: (data: Category[]) => {
        if (data) {
          this.categories = data;
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log(this.categories);
        }
      },
      error: (err: any) => {
        console.error('Failed to load categories', err);
        this.categories = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getColor(index: number): string {
    return ColorHelper.getColorForIndex(index);
  }

  openAddModal(): void {
    this.categoryForm.reset({ name: '', icon: 'bi-three-dots' });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onSubmit(): void {
    if (this.categoryForm.invalid || this.isSaving) return;

    const formVal = this.categoryForm.value;
    const category: Category = {
      id: 'cat-' + this.generateId(),
      name: formVal.name!.trim(),
      icon: formVal.icon!,
    };

    this.isSaving = true;
    this.categoryService.create(category).subscribe({
      next: (created: Category) => {
        this.categories.push(created);
        this.isSaving = false;
        this.showAddModal = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to add category', err);
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  private generateId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
