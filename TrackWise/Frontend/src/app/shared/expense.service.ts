import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { Expense } from './model/Expense';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  list(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.baseUrl + '/api/Expenses');
  }

  get(id: number): Observable<Expense> {
    return this.http.get<Expense>(this.baseUrl + '/api/Expenses/' + id);
  }

  create(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl + '/api/Expenses', expense);
  }

  update(id: number, expense: Expense): Observable<void> {
    return this.http.put<void>(this.baseUrl + '/api/Expenses/' + id, expense);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/api/Expenses/' + id);
  }

  getCategoryTotals(month: number) {
    return this.http.get<Array<{ category: string; amount: number }>>(
      this.baseUrl + '/api/Dashboard/categories?month=' + month
    );
  }

  getAmountByMonth(month: number) {
    return this.http.get<number>(this.baseUrl + '/api/Dashboard/getAmountByMonth?month=' + month);
  }

  getExpensesByCategory(month: number) {
    return this.http.get<Array<{ category: string; amount: number }>>(
      this.baseUrl + '/api/Dashboard/getExpensesByCategory?month=' + month
    );
  }

  getExpensesByMonth(year?: number) {
    const params = year ? '?year=' + year : '';
    return this.http.get<Array<{ month: number; amount: number }>>(
      this.baseUrl + '/api/Dashboard/getExpensesByMonth' + params
    );
  }
}
