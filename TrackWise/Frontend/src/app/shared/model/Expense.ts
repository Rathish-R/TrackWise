import { Category } from './category';

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category?: Category | null;
  date: string;
  categoryId?: string;
}
