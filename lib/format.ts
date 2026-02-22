import { format, parseISO } from 'date-fns'

/**
 * Format a number as South African Rand (af-ZA locale).
 * e.g. 4085 → "4 085,00"  |  -90 → "-90,00"
 */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('af-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format for displaying signed amounts:
 * positive income/fill: "+4 085,00" (green)
 * negative/expense: "4 085,00" (white) or "-90,00" (red)
 */
export function formatSignedZAR(amount: number, showPositive = false): string {
  const formatted = formatZAR(Math.abs(amount))
  if (amount > 0 && showPositive) return `+${formatted}`
  if (amount < 0) return `-${formatted}`
  return formatted
}

/**
 * Format date for date group headers.
 * e.g. "Sat" and "Feb 21, 2026"
 */
export function formatDateGroupDay(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE')
}

export function formatDateGroupFull(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM dd, yyyy')
}

/**
 * Format date for form fields.
 * e.g. "02/22/2026"
 */
export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MM/dd/yyyy')
}

/**
 * Format date for scheduled/upcoming display.
 * e.g. "03/01/2026"
 */
export function formatScheduleDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MM/dd/yyyy')
}

/**
 * Parse a user-entered ZAR string back to a number.
 * Handles "4 085,50" → 4085.5
 */
export function parseZARInput(input: string): number {
  // Remove spaces, replace comma with dot
  const cleaned = input.replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
