/**
 * Utility functions for odds calculations
 * Migrated from app.js for use in React Native
 */

export interface KellyResult {
  percent: number;
  amount: number;
}

export interface EVResult {
  ev: number; // As percentage
  evDecimal: number;
  trueProb: number;
  recOdds: number;
}

/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return (odds + 100) / 100;
  } else {
    return (100 - odds) / 100;
  }
}

/**
 * Convert American odds to implied probability
 */
export function americanToImpliedProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return -odds / (-odds + 100);
  }
}

/**
 * Convert implied probability to American odds
 */
export function impliedProbToAmerican(prob: number): number {
  if (prob >= 0.5) {
    return -(prob * 100) / (1 - prob);
  } else {
    return (100 * (1 - prob)) / prob;
  }
}

/**
 * Convert decimal odds to American odds
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return (decimal - 1) * 100;
  } else {
    return -100 / (decimal - 1);
  }
}

/**
 * Calculate Kelly Criterion bet size
 */
export function calculateKelly(
  trueProb: number,
  odds: number,
  bankroll: number
): KellyResult {
  if (!bankroll || bankroll <= 0) return { percent: 0, amount: 0 };

  const decimalOdds = americanToDecimal(odds);
  const q = 1 - trueProb;
  const p = trueProb;
  const b = decimalOdds - 1;

  if (b <= 0 || p <= 0) return { percent: 0, amount: 0 };

  const kellyPercent = (b * p - q) / b;

  // Apply fractional Kelly (0.5) for safety, limit to 10% max
  const safeKellyPercent = Math.min(Math.max(kellyPercent * 0.5, 0), 0.1);
  const kellyAmount = bankroll * safeKellyPercent;

  return {
    percent: safeKellyPercent * 100,
    amount: kellyAmount,
  };
}

/**
 * Round bet size based on favorite/underdog status
 */
export function roundBetSize(
  amount: number,
  odds: number,
  isFavorite: boolean
): number {
  // First round to nearest whole number
  let rounded = Math.round(amount);

  // For favorites (-101 or greater, meaning -101, -110, -150, etc.)
  if (isFavorite && odds <= -101) {
    // Round winning amount to nearest $50, then calculate wager from that
    const decimalOdds = americanToDecimal(odds);
    const winAmount = rounded * (decimalOdds - 1);
    const roundedWin = Math.round(winAmount / 50) * 50;
    const newWager = roundedWin / (decimalOdds - 1);
    return Math.round(newWager);
  }
  // For dogs (+101 or greater)
  else if (!isFavorite && odds >= 101) {
    // Round wager amount to nearest $50
    return Math.round(rounded / 50) * 50;
  }
  // Default: already rounded to nearest whole number
  return rounded;
}

/**
 * Round win amount based on favorite/underdog status
 */
export function roundWinAmount(
  wagerAmount: number,
  odds: number,
  isFavorite: boolean
): number {
  const decimalOdds = americanToDecimal(odds);
  let winAmount = wagerAmount * (decimalOdds - 1);

  // For favorites -101 or greater, win amount should already be rounded to $50
  if (isFavorite && odds <= -101) {
    winAmount = Math.round(winAmount / 50) * 50;
  }

  return Math.round(winAmount);
}

/**
 * Calculate Expected Value (EV)
 */
export function calculateEV(
  trueProb: number,
  recOdds: number,
  side: string
): EVResult | null {
  if (!trueProb || !recOdds) return null;

  const recDecimal = americanToDecimal(recOdds);
  const winProb = trueProb;
  const loseProb = 1 - trueProb;

  // For a $1 bet
  const winAmount = recDecimal - 1;
  const ev = winProb * winAmount - loseProb * 1;

  return {
    ev: ev * 100, // As percentage
    evDecimal: ev,
    trueProb: winProb,
    recOdds: recOdds,
  };
}
