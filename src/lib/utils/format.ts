/**
 * Utility functions for formatting values
 */

/**
 * Format a date to a human-readable string
 * @param date - The date to format
 * @returns A formatted date string (e.g., "Jan 15, 2023")
 */
export function formatDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a number of hours to a decimal string
 * @param hours - The hours to format
 * @returns A formatted hours string (e.g., "8.50")
 */
export function formatHours(hours: number): string {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return '0.00';
  }
  
  return hours.toFixed(2);
}

/**
 * Format currency values
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
} 