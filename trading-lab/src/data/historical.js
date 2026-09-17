export const SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'AAPL'];
export const REPLAY_SESSION_DATE = '2024-01-16';

export function normalizeProviderTime(value, sessionDate = REPLAY_SESSION_DATE) {
  if (value == null || value === '') return null;
  const text = String(value).trim();
  if (/^\d{1,2}:\d{2}$/.test(text)) {
    const [hour, minute] = text.split(':');
    return `${sessionDate}T${String(hour).padStart(2, '0')}:${minute}:00.000Z`;
  }
  return text;
}

export function providerTimeMs(value) {
  const normalized = normalizeProviderTime(value);
  const ms = Date.parse(normalized || '');
  return Number.isFinite(ms) ? ms : Number.NaN;
}

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
    return { index: i, time, providerTime: normalizeProviderTime(time), open, high, low, close, volume };
  });
}
