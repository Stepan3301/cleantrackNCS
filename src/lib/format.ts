
/**
 * Format a value for display, showing a dash if the value is null or undefined
 */
export function formatValue<T>(value: T | null | undefined, formatter?: (val: T) => string): string {
  if (value === null || value === undefined) {
    return "-";
  }
  
  return formatter ? formatter(value) : String(value);
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format currency in AED format
 */
export function formatCurrency(value: number): string {
  return `AED ${formatNumber(value)}`;
}
