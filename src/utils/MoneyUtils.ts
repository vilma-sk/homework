export class MoneyUtils {
  /**
   * Convert a money string like "€3.50", "-€0.35", " 3,50 " into a number.
   */
  static toNumber(value: string): number {
    if (!value) return 0;

    // Remove currency symbols, spaces, and non-numeric characters except . , -
    const cleaned = value
      .replace(/[^\d.,-]/g, '')   // keep digits, comma, dot, minus
      .replace(/,/g, '.');         // normalize comma decimals

    const num = Number(cleaned);

    return isNaN(num) ? 0 : num;
  }

  /**
   * Rounds a number to specified decimal places (default is 2).
   */
  static round(value: number, decimals: number = 2): number {
    return Number(value.toFixed(decimals));
  }
}