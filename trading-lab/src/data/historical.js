export const SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'AAPL'];

// Deterministic synthetic one-minute candles used to exercise the replay engine
// without representing the values as historical exchange data.
export function makeSyntheticSeries(symbol, bars = 390) {
  const seeds = { SPY: 672.14, QQQ: 601.22, NVDA: 177.31, AAPL: 238.18 };
  let price = seeds[symbol] ?? 100;

  return Array.from({ length: bars }, (_, i) => {
    const trend = Math.sin(i / 37) * 0.0012 + Math.sin(i / 11) * 0.00045;
    const shock = ((Math.sin(i * 12.9898) * 43758.5453) % 1 - 0.5) * 0.0012;
    const open = price;
    const close = Math.max(1, price * (1 + trend + shock));
    const high = Math.max(open, close) * (1 + 0.0007 + Math.abs(Math.sin(i)) * 0.0006);
    const low = Math.min(open, close) * (1 - 0.0007 - Math.abs(Math.cos(i)) * 0.0006);
    const volume = Math.round(800_000 + (Math.sin(i / 8) + 1) * 350_000 + Math.abs(Math.sin(i * 3)) * 500_000);
    const sessionMinute = 9 * 60 + 30 + i;
    const hour = Math.floor(sessionMinute / 60);
    const minute = sessionMinute % 60;
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    price = close;
    return { index: i, time, open, high, low, close, volume };
  });
}
