import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { DashboardComponent } from './main/dashboard/dashboard';
import { ExpenseListComponent } from './main/expense-list/expense-list';
import { ExpenseCategoryComponent } from './main/expense-category/expense-category';
import { AddExpenseComponent } from './main/add-expense/add-expense';
import { Main } from './main/main';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: Main,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'expenses', component: ExpenseListComponent },
      { path: 'add-expense', component: AddExpenseComponent },
      { path: 'categories', component: ExpenseCategoryComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
