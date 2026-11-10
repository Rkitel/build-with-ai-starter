export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC';

export const CURRENCY_RATES: Record<SupportedCurrency, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: '$', rate: 1.0, prefix: true },
  EUR: { symbol: '€', rate: 0.933, prefix: true },
  GBP: { symbol: '£', rate: 0.774, prefix: true },
  JPY: { symbol: '¥', rate: 152.88, prefix: true },
  BTC: { symbol: '₿', rate: 0.0000112, prefix: true },
};

export function formatPrice(value: number, category?: string, currency: SupportedCurrency = 'USD'): string {
  if (value === undefined || value === null || isNaN(value)) return '--';
  
  const currInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = category === 'bonds' ? value : value * currInfo.rate;

  if (category === 'bonds') {
    return `${value.toFixed(3)}%`;
  }

  let decimals = 2;
  if (category === 'forex' && currency === 'USD') {
    decimals = 4;
  } else if (value < 1) {
    decimals = 4;
  } else if (currency === 'BTC') {
    decimals = 6;
  } else if (currency === 'JPY') {
    decimals = 0;
  }

  const formattedNum = converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return currInfo.prefix ? `${currInfo.symbol}${formattedNum}` : `${formattedNum} ${currInfo.symbol}`;
}

export function formatChange(change: number, category?: string): string {
  if (change === undefined || change === null || isNaN(change)) return '0.00';
  const sign = change > 0 ? '+' : '';
  const decimals = category === 'forex' ? 4 : (category === 'bonds' ? 3 : 2);
  return `${sign}${change.toFixed(decimals)}`;
}

export function formatPercent(percent: number): string {
  if (percent === undefined || percent === null || isNaN(percent)) return '0.00%';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}
