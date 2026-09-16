import { SYMBOLS, makeSyntheticSeries } from './data/historical.js';

export function createReplayStore() {
  const series = Object.fromEntries(SYMBOLS.map(symbol => [symbol, makeSyntheticSeries(symbol)]));
  return { series, cursor: 0, speed: 1, playing: false };
}

export function snapshot(store, symbol) {
  const bars = store.series[symbol] ?? [];
  const end = Math.min(store.cursor + 1, bars.length);
  return bars.slice(0, end);
}

export function advance(store) {
  const max = Math.max(...Object.values(store.series).map(bars => bars.length));
  store.cursor = Math.min(store.cursor + 1, max - 1);
  return store.cursor;
}

export function reset(store) {
  store.cursor = 0;
  store.playing = false;
}
