/**
 * Format utilities for currency, dates, and numbers
 */

/**
 * Format a number as Brazilian Real currency
 * @param value - The numeric value to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(
  value: number | undefined | null,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return options?.showSymbol !== false ? "R$ 0,00" : "0,00";
  }

  const { showSymbol = true, minimumFractionDigits = 2, maximumFractionDigits = 2 } = options ?? {};

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: showSymbol ? "currency" : "decimal",
    currency: "BRL",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

  return formatted;
}

/**
 * Format a number with thousand separators (Brazilian format)
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1.234")
 */
export function formatNumber(value: number | undefined | null, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value
 * @param value - The percentage value (e.g., 0.75 for 75%)
 * @param options - Optional formatting options
 * @returns Formatted percentage string (e.g., "75%")
 */
export function formatPercentage(
  value: number | undefined | null,
  options?: {
    alreadyPercentage?: boolean;
    decimals?: number;
  }
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0%";
  }

  const { alreadyPercentage = false, decimals = 0 } = options ?? {};
  const percentValue = alreadyPercentage ? value : value * 100;

  return `${formatNumber(percentValue, decimals)}%`;
}

/**
 * Format a date relative to now (e.g., "há 2 dias", "hoje", "ontem")
 * @param date - The date to format (string or Date)
 * @returns Relative time string in Portuguese
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) {
    return "";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return "agora";
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "há 1 minuto" : `há ${diffMinutes} minutos`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? "há 1 hora" : `há ${diffHours} horas`;
  }

  if (diffDays === 1) {
    return "ontem";
  }

  if (diffDays < 7) {
    return `há ${diffDays} dias`;
  }

  if (diffWeeks < 4) {
    return diffWeeks === 1 ? "há 1 semana" : `há ${diffWeeks} semanas`;
  }

  if (diffMonths < 12) {
    return diffMonths === 1 ? "há 1 mês" : `há ${diffMonths} meses`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "há 1 ano" : `há ${diffYears} anos`;
}

/**
 * Format a date in Brazilian format (DD/MM/YYYY)
 * @param date - The date to format
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | undefined | null,
  options?: {
    includeTime?: boolean;
  }
): string {
  if (!date) {
    return "";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (options?.includeTime) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Format hours with "h" suffix
 * @param hours - Number of hours
 * @param estimated - Optional estimated hours for comparison
 * @returns Formatted hours string (e.g., "12h" or "12h / 20h")
 */
export function formatHours(hours: number | undefined | null, estimated?: number | null): string {
  const h = hours ?? 0;

  if (estimated !== undefined && estimated !== null) {
    return `${formatNumber(h)}h / ${formatNumber(estimated)}h`;
  }

  return `${formatNumber(h)}h`;
}
