import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
          { name: 'Food', y: 34.2 },
          { name: 'Transport', y: 22.1 },
          { name: 'Shopping', y: 18.7 },
          { name: 'Bills', y: 14.0 },
          { name: 'Other', y: 11.0 },
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
        data: [980, 1250, 1120, 1350, 1500, 1400, 1520, 1680, 1800, 1720, 1840, 1950],
        color: '#3b82f6',
      },
    ],
  };

  constructor(private expenseService: ExpenseService) {}

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
      .pipe(finalize(() => (this.loading.total = false)))
      .subscribe({
        next: (total) => {
          this.totalAmount = total ?? 0;
        },
        error: (err) => {
          console.error('Error loading total amount:', err);
          this.totalAmount = 0;
        },
      });
  }

  private loadExpensesByCategory(month: number): void {
    this.loading.categories = true;
    this.expenseService
      .getExpensesByCategory(month)
      .pipe(finalize(() => (this.loading.categories = false)))
      .subscribe({
        next: (categoryData) => {
          try {
            // Transform the data for Highcharts pie chart
            const chartData = categoryData.map((item: any) => {
              const categoryName = item.category || item.Category || 'Unknown';
              const amount = item.amount || item.Amount || 0;
              return {
                name: categoryName,
                y: typeof amount === 'number' ? parseFloat(amount.toFixed(2)) : 0,
              };
            });

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
            }
          } catch (error) {
            console.error('Error transforming category data:', error);
          }
        },
        error: (err) => {
          console.error('Error loading expenses by category:', err);
        },
      });
  }

  private loadExpensesByMonth(): void {
    this.loading.activity = true;
    this.expenseService.getExpensesByMonth().subscribe({
      next: (monthlyData) => {
        try {
          const chartData = monthlyData.map((item: any) => {
            const amount = item.amount || item.Amount || 0;
            return typeof amount === 'number' ? parseFloat(amount.toFixed(2)) : 0;
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
          }
        } catch (error) {
          console.error('Error transforming monthly data:', error);
        }
        this.loading.activity = false;
      },
      error: (err) => {
        console.error('Error loading expenses by month:', err);
        this.loading.activity = false;
      },
      complete: () => {
        this.loading.activity = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Create charts directly into DOM containers
    setTimeout(() => {
      try {
        this.pieChart = Highcharts.chart('pieChartContainer', this.pieChartOptions as any);
      } catch (e) {
        console.warn('Pie chart render failed', e);
      }

      try {
        this.lineChart = Highcharts.chart('lineChartContainer', this.lineChartOptions as any);
      } catch (e) {
        console.warn('Line chart render failed', e);
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.lineChart?.destroy();
  }

  toggleMenu(key: 'total' | 'categories' | 'activity'): void {
    this.menuOpen[key] = !this.menuOpen[key];
  }
}
