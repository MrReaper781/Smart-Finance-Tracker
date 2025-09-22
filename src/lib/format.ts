export type CurrencyCode = 'USD' | 'EUR' | 'INR';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getUserCurrency(): CurrencyCode {
  return getLocal<CurrencyCode>('sft:currency', 'USD');
}

export function getUserDateFormat(): DateFormat {
  return getLocal<DateFormat>('sft:dateFormat', 'MM/DD/YYYY');
}

export function formatCurrency(amount: number, currency?: CurrencyCode): string {
  const cur = currency || getUserCurrency();
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount);
  } catch {
    // Fallback for unsupported locales/currencies
    const symbol = cur === 'INR' ? '₹' : cur === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  }
}

export function formatDateISOToPreference(isoDate: string, dateFormat?: DateFormat): string {
  const df = dateFormat || getUserDateFormat();
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (df === 'MM/DD/YYYY') return `${m}/${day}/${y}`;
  if (df === 'DD/MM/YYYY') return `${day}/${m}/${y}`;
  return `${y}-${m}-${day}`;
}
