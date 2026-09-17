import { BREADTH_UNIVERSE } from './market-memory.js';

export const CORE_UNIVERSE = ['SPY', 'QQQ', 'NVDA', 'AAPL'];
export const SECTOR_UNIVERSE = ['XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC'];
export const INDEX_UNIVERSE = ['SPY', 'QQQ', 'IWM', 'DIA'];
export const LARGE_CAP_UNIVERSE = BREADTH_UNIVERSE.filter((symbol) => !INDEX_UNIVERSE.includes(symbol) && !SECTOR_UNIVERSE.includes(symbol));
export const LIVE_UNIVERSE = [...BREADTH_UNIVERSE];

export function universeTier(symbol) {
  if (CORE_UNIVERSE.includes(symbol)) return 'CORE';
  if (INDEX_UNIVERSE.includes(symbol)) return 'INDEX';
  if (SECTOR_UNIVERSE.includes(symbol)) return 'SECTOR';
  return 'LARGE_CAP';
}

export function prioritizedSeedSymbols(selected = null) {
  return [...new Set([selected, ...CORE_UNIVERSE, ...INDEX_UNIVERSE, ...SECTOR_UNIVERSE, ...LARGE_CAP_UNIVERSE].filter(Boolean))];
}
