export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return fallback;
  return numerator / denominator;
}

export function percent(numerator: number, denominator: number): number {
  return safeDivide(numerator * 100, denominator, 0);
}

export function roundCurrency(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function roundNumber(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((Number.isFinite(value) ? value : 0) * factor) / factor;
}

export function calculateDelta(current: number, previous: number): number {
  return roundNumber((current || 0) - (previous || 0), 2);
}

export function calculatePctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return roundNumber(((current - previous) / previous) * 100, 2);
}
