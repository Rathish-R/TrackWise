import { Category } from './category';
import { User } from './user';

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category?: Category | null;
  date: string;
  user?: User | null;
  categoryId?: string;
  userId?: string;
}
