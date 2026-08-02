import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../shared/expense.service';
import { CategoryService } from '../../shared/category.service';
import { AuthService } from '../../shared/auth.service';
import { Category } from '../../shared/model/category';
import { Expense } from '../../shared/model/expense';

@Component({
  selector: 'app-add-expense',
  imports: [ReactiveFormsModule],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.css',
})
export class AddExpenseComponent implements OnInit {
  categories: Category[] = [];
  expenseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private auth: AuthService,
    private router: Router,
  ) {
    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      categoryId: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (cats: Category[]) => (this.categories = cats),
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) return;

    const formVal = this.expenseForm.value;
    const expense: Expense = {
      title: formVal.title!,
      amount: formVal.amount!,
      categoryId: formVal.categoryId!,
      date: formVal.date!,
      userId: this.auth.userId ?? 'user1',
    };

    this.expenseService.create(expense).subscribe({
      next: () => this.router.navigate(['/expenses']),
      error: (err: any) => console.error('Failed to add expense', err),
    });
  }

  onCancel(): void {
    this.router.navigate(['/expenses']);
  }
}
