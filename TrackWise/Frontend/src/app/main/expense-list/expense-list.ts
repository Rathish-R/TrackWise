import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../shared/expense.service';
import { Expense } from '../../shared/model/expense';

interface ExpenseRow {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  userId: string;
}

@Component({
  selector: 'app-expense-list',
  imports: [],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
})
export class ExpenseListComponent implements OnInit {
  public expenses: ExpenseRow[] = [];

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.list().subscribe({
      next: (data: Expense[]) => {
        this.expenses = data.map((e: Expense) => ({
          id: e.id ?? 0,
          title: e.title ?? '',
          amount: e.amount ?? 0,
          category: e.category?.name ?? 'Uncategorized',
          date: e.date ? new Date(e.date).toLocaleDateString('en-GB') : '',
          userId: e.userId ?? '',
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load expenses', err);
        this.expenses = [];
      },
    });
  }

  onAddExpense(): void {
    this.router.navigate(['/add-expense']);
  }

  onDelete(id: number): void {
    this.expenseService.delete(id).subscribe({
      next: () => this.loadExpenses(),
      error: (err: any) => console.error('Failed to delete expense', err),
    });
  }
}
