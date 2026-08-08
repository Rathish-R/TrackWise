import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../shared/expense.service';
import { Expense } from '../../shared/model/expense';


@Component({
  selector: 'app-expense-list',
  imports: [],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
})
export class ExpenseListComponent implements OnInit {
  public expenses: Expense[] = [];
  public isLoading:boolean = false;
  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.isLoading =true;
    this.expenseService.list().subscribe({
      next: (data: Expense[]) => {
        
         this.isLoading = false;
         if(data == null) this.expenses=[]
        this.expenses = data.map((e: Expense) => e);
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
  getCategory(category:any){
    if(category && category!.name){
      return category!.name!.toString();
    }
    else {
      return "N/A";
    }
  }
}
