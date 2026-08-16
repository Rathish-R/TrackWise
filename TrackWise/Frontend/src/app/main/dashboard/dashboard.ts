import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import * as Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsNoData from 'highcharts/modules/no-data-to-display';
import { ExpenseService } from '../../shared/expense.service';
import { Expense } from '../../shared/model/Expense';
import { AuthService } from '../../shared/auth.service';

HighchartsExporting(Highcharts);
HighchartsNoData(Highcharts);
Highcharts.setOptions({
  lang: {
    noData: 'No data to display',
  },
});
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private pieChart?: Highcharts.Chart;
  private lineChart?: Highcharts.Chart;
  public totalAmount = 0;
  public loading = {
    categories: false,
    activity: false,
    total: false,
  };
  public menuOpen = {
    total: false,
    categories: false,
    activity: false,
  };

  public monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  public selectedMonthFilters: Record<'total' | 'categories', { month: number; year: number; labelKey: 'current' | 'previous' | 'month' }> = {
    total: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), labelKey: 'current' },
    categories: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), labelKey: 'current' },
  };
  public monthMenuOpen = {
    total: false,
    categories: false,
  };

  getMonthLabel(key: 'total' | 'categories'): string {
    const filter = this.selectedMonthFilters[key];
    if (filter.labelKey === 'current') return 'Current month';
    if (filter.labelKey === 'previous') return 'Previous month';
    return `${this.monthNames[filter.month - 1]} ${filter.year}`;
  }

  public menuItems: Record<'total' | 'categories' | 'activity', { label: string; icon: string; action: string }[]> = {
    total: [{ label: 'View expenses', icon: 'bi-list-ul', action: 'view-expenses' }],
    categories: [
      { label: 'Download as PNG', icon: 'bi-image', action: 'png' },
      { label: 'Download as SVG', icon: 'bi-file-earmark-code', action: 'svg' },
      { label: 'Print chart', icon: 'bi-printer', action: 'print' },
    ],
    activity: [
      { label: 'Download as PNG', icon: 'bi-image', action: 'png' },
      { label: 'Download as SVG', icon: 'bi-file-earmark-code', action: 'svg' },
      { label: 'Print chart', icon: 'bi-printer', action: 'print' },
    ],
  };

  public pieChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 240,
    },
    exporting: {
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
    },
    title: {
      text: undefined,
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    },
    accessibility: {
      point: {
        valueSuffix: '%',
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        },
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Expenses',
        data: [
        ],
      },
    ],
  };

  public lineChartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      height: 360,
    },
    exporting: {
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
    },
    title: {
      text: undefined,
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          color: '#6b7280',
        },
      },
    },
    yAxis: {
      title: {
        text: 'Amount ($)',
      },
      labels: {
        style: {
          color: '#6b7280',
        },
      },
    },
    tooltip: {
      pointFormat: '<b>${point.y:.2f}</b>',
    },
    series: [
      {
        type: 'line',
        name: 'Expenses',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: '#3b82f6',
      },
    ],
  };

  constructor(
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService,
  ) {}

  get currency(): string {
    return this.auth.currency;
  }

  ngOnInit(): void {
    // Load real expense data for charts (categories for current month)
    this.loadTotalForMonth(this.selectedMonthFilters.total.month);
    this.loadExpensesByCategory(this.selectedMonthFilters.categories.month);
    this.loadExpensesByMonth();
  }

  private loadTotalForMonth(month: number): void {
    this.loading.total = true;
    this.expenseService.getAmountByMonth(month)
      .subscribe({
        next: (total) => {
          this.totalAmount = total ?? 0;this.loading.total = false

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading total amount:', err);
          this.totalAmount = 0;this.loading.total = false
          this.cdr.detectChanges();
        },
      });
  }

  private loadExpensesByCategory(month: number): void {
    this.loading.categories = true;
    this.expenseService
      .getExpensesByCategory(month)
      .subscribe({
        next: (categoryData) => {
          try {
            const chartData = categoryData.map((item: any) => {
              const categoryName = item.category || item.Category || 'Unknown';
              const raw = item.amount ?? item.Amount ?? 0;
              const amountNum = typeof raw === 'number' ? raw : Number(raw);
              const y = Number.isFinite(amountNum) ? parseFloat(amountNum.toFixed(2)) : 0;
              return { name: categoryName, y };
            });

            this.pieChartOptions = {
              ...this.pieChartOptions,
              series: [
                {
                  type: 'pie',
                  name: 'Expenses',
                  data: chartData as any,
                },
              ],
            };

            if (this.pieChart && this.pieChart.series && this.pieChart.series[0]) {
              this.pieChart.series[0].setData(chartData as any, true);
            }
            this.loadChanges();
          } catch (error) {
            console.error('Error transforming category data:', error);
          } finally {
            this.loading.categories = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error loading expenses by category:', err);
          this.loading.categories = false;
          this.cdr.detectChanges();
        },
      });
  }

  private loadExpensesByMonth(): void {
    this.expenseService.getExpensesByMonth().subscribe({
        next: (monthlyData) => {
          try {
            const chartData = monthlyData.map((item: any) => {
              const raw = item.amount ?? item.Amount ?? 0;
              const num = typeof raw === 'number' ? raw : Number(raw);
              return Number.isFinite(num) ? parseFloat(num.toFixed(2)) : 0;
            });

            this.lineChartOptions = {
              ...this.lineChartOptions,
              series: [
                {
                  type: 'line',
                  name: 'Expenses',
                  data: chartData,
                  color: '#3b82f6',
                },
              ],
            };

            if (this.lineChart && this.lineChart.series && this.lineChart.series[0]) {
              this.lineChart.series[0].setData(chartData, true);
            }
            this.loadChanges();
          } catch (error) {
            console.error('Error transforming monthly data:', error);
          } finally {
            this.loading.activity = false;
            this.cdr.detectChanges();
          }
        },
      error: (err) => {
        console.error('Error loading expenses by month:', err);
        this.loading.activity = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading.activity = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    // Create charts directly into DOM containers
    setTimeout(() => {
      this.loadChanges();
    }, 0);
  }

  // Centralized chart creation/update helper
  private loadChanges(): void {
    try {
      // Pie chart container
      const pieEl = document.getElementById('pieChartContainer');
      if (pieEl) {
        try {
          if (!this.pieChart) {
            this.pieChart = Highcharts.chart(pieEl as any, this.pieChartOptions as any);
          } else if (this.pieChartOptions && this.pieChartOptions.series && this.pieChart.series[0]) {
            const newSeries = (this.pieChartOptions.series as Highcharts.SeriesOptionsType[])[0];
            if (newSeries && Array.isArray((newSeries as any).data)) {
              (this.pieChart.series[0] as Highcharts.Series).setData((newSeries as any).data, true);
            } else {
              (this.pieChart.series[0] as Highcharts.Series).update(newSeries, true);
            }
          }
        } catch (e) {
          console.warn('Pie chart render/update failed', e);
        }
      }

      // Line chart container
      const lineEl = document.getElementById('lineChartContainer');
      if (lineEl) {
        try {
          if (!this.lineChart) {
            this.lineChart = Highcharts.chart(lineEl as any, this.lineChartOptions as any);
          } else if (this.lineChartOptions && this.lineChartOptions.series && this.lineChart.series[0]) {
            const newSeries = (this.lineChartOptions.series as Highcharts.SeriesOptionsType[])[0];
            if (newSeries && Array.isArray((newSeries as any).data)) {
              (this.lineChart.series[0] as Highcharts.Series).setData((newSeries as any).data, true);
            } else {
              (this.lineChart.series[0] as Highcharts.Series).update(newSeries, true);
            }
          }
        } catch (e) {
          console.warn('Line chart render/update failed', e);
        }
      }
    } finally {
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.lineChart?.destroy();
  }

  toggleMenu(key: 'total' | 'categories' | 'activity'): void {
    this.menuOpen[key] = !this.menuOpen[key];
  }

  toggleMonthMenu(key: 'total' | 'categories'): void {
    this.monthMenuOpen[key] = !this.monthMenuOpen[key];
  }

  onMonthSelect(key: 'total' | 'categories', month: number, year?: number): void {
    const filter = this.selectedMonthFilters[key];
    filter.month = month;
    if (year) filter.year = year;
    filter.labelKey = 'month';
    this.monthMenuOpen[key] = false;

    if (key === 'total') {
      this.loadTotalForMonth(month);
    } else {
      this.loadExpensesByCategory(month);
    }
  }

  selectCurrentMonth(key: 'total' | 'categories'): void {
    const now = new Date();
    const filter = this.selectedMonthFilters[key];
    filter.month = now.getMonth() + 1;
    filter.year = now.getFullYear();
    filter.labelKey = 'current';
    this.monthMenuOpen[key] = false;

    if (key === 'total') {
      this.loadTotalForMonth(filter.month);
    } else {
      this.loadExpensesByCategory(filter.month);
    }
  }

  selectPreviousMonth(key: 'total' | 'categories'): void {
    const filter = this.selectedMonthFilters[key];
    const prev = new Date(filter.year, filter.month - 2, 1);
    filter.month = prev.getMonth() + 1;
    filter.year = prev.getFullYear();
    filter.labelKey = 'previous';
    this.monthMenuOpen[key] = false;

    if (key === 'total') {
      this.loadTotalForMonth(filter.month);
    } else {
      this.loadExpensesByCategory(filter.month);
    }
  }

  onMenuAction(key: 'total' | 'categories' | 'activity', action: string): void {
    this.menuOpen[key] = false;

    if (action === 'view-expenses') {
      this.router.navigate(['/expenses']);
      return;
    }

    const chart = key === 'categories' ? this.pieChart : key === 'activity' ? this.lineChart : undefined;
    if (!chart) return;

    const filename = key === 'categories' ? 'category-spend' : 'monthly-trend';
    switch (action) {
      case 'png':
        chart.exportChart({ type: 'image/png', filename }, {});
        break;
      case 'svg':
        chart.exportChart({ type: 'image/svg+xml', filename }, {});
        break;
      case 'print':
        chart.print();
        break;
    }
  }
}
