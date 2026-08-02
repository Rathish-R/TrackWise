export class ColorHelper {
  private static readonly colors: string[] = [
    '#d63031',
    '#e17055',
    '#f39c12',
    '#27ae60',
    '#00b894',
    '#0984e3',
    '#6c5ce7',
    '#8e44ad',
    '#e84393',
    '#16a085',
    '#d35400',
    '#2d3436',
  ];

  static getColors(): string[] {
    return this.colors;
  }

  static getColorForIndex(index: number): string {
    return this.colors[index % this.colors.length];
  }
}
