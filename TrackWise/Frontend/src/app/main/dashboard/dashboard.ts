import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { ExpenseService } from '../../shared/expense.service';
import { Expense } from '../../shared/model/expense';
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
  public menuOpen = {
    total: false,
    categories: false,
    activity: false,
  };

  public pieChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 320,
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
    // Load real expense data
    this.expenseService.list().subscribe({
      next: (expenses: Expense[]) =>{
        // this.expenses
      },
      error: () => {
        // keep placeholders on error
      },
    });
  }

  ngAfterViewInit(): void {
    // Create charts directly into DOM containers
    try {
      this.pieChart = Highcharts.chart('pieChartContainer', this.pieChartOptions as any);
    } catch (e) {
      // ignore render errors in non-browser environments
      // console.warn('Pie chart render failed', e);
    }

    try {
      this.lineChart = Highcharts.chart('lineChartContainer', this.lineChartOptions as any);
    } catch (e) {
      // console.warn('Line chart render failed', e);
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
