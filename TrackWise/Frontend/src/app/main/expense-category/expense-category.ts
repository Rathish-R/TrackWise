import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { CategoryService } from '../../shared/category.service';
import { Category } from '../../shared/model/category';
import { ColorHelper } from './color-helper';

@Component({
  selector: 'app-expense-category',
  imports: [NgClass],
  templateUrl: './expense-category.html',
  styleUrl: './expense-category.css',
})
export class ExpenseCategoryComponent implements OnInit {
  public categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: (data: Category[]) => {
        if (data) {
          this.categories = data;
          this.cdr.detectChanges();
          console.log(this.categories);
        }
      },
      error: (err: any) => {
        console.error('Failed to load categories', err);
        this.categories = [];
      },
    });
  }

  getColor(index: number): string {
    return ColorHelper.getColorForIndex(index);
  }
}
