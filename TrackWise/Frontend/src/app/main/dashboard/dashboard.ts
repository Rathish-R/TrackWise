import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import * as Highcharts from 'highcharts';
import { ExpenseService } from '../../shared/expense.service';
import { Expense } from '../../shared/model/Expense';
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

  public pieChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 240,
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

  constructor(private expenseService: ExpenseService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Load real expense data for charts (categories for current month)
    const currentMonth = new Date().getMonth() + 1;
    this.loadTotalForMonth(currentMonth);
    this.loadExpensesByCategory(currentMonth);
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
            // Transform the data for Highcharts pie chart
            const chartData = categoryData.map((item: any) => {
              const categoryName = item.category || item.Category || 'Unknown';
              const raw = item.amount ?? item.Amount ?? 0;
              const amountNum = typeof raw === 'number' ? raw : Number(raw);
              const y = Number.isFinite(amountNum) ? parseFloat(amountNum.toFixed(2)) : 0;
              return { name: categoryName, y };
            });
            this.loading.categories = false;
            this.cdr.detectChanges();

            if (chartData && chartData.length > 0) {
              // Update pie chart options
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

              // If chart is already rendered, update it
              if (this.pieChart && this.pieChart.series && this.pieChart.series[0]) {
                this.pieChart.series[0].setData(chartData as any, true);
              }
              // Ensure charts are created/updated in DOM
              this.loadChanges();
              this.cdr.detectChanges();
            }
          } catch (error) {
            console.error('Error transforming category data:', error);
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
              this.cdr.detectChanges();
    this.expenseService.getExpensesByMonth().subscribe({
      next: (monthlyData) => {
        try {
          const chartData = monthlyData.map((item: any) => {
            const raw = item.amount ?? item.Amount ?? 0;
            const num = typeof raw === 'number' ? raw : Number(raw);
            return Number.isFinite(num) ? parseFloat(num.toFixed(2)) : 0;
          });

          if (chartData && chartData.length > 0) {
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
            // Update/create charts inside DOM
            this.loadChanges();
            this.cdr.detectChanges();
          }
        } catch (error) {
          console.error('Error transforming monthly data:', error);
        }
        this.loading.activity = false;
        this.cdr.detectChanges();
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
}
