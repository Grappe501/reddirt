const VERSION = 1;
const DEFAULT_KEY = 'reddirt:trading-lab:market-memory:v1';

export const BREADTH_UNIVERSE = [
  'SPY', 'QQQ', 'IWM', 'DIA',
  'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC',
  'NVDA', 'AAPL', 'MSFT', 'AMZN', 'META', 'GOOGL', 'TSLA', 'AMD', 'AVGO', 'JPM',
];

const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

export function createMarketMemory({ storage = null, key = DEFAULT_KEY, maxObservations = 10000 } = {}) {
  const memory = {
    version: VERSION,
    key,
    maxObservations,
    observations: [],
    decisions: [],
    trades: [],
    experimentRuns: [],
    sourceHealth: [],
    regimes: [],
  };
  if (!storage) return memory;
  try {
    const saved = JSON.parse(storage.getItem(key) || 'null');
    if (saved?.version === VERSION) Object.assign(memory, saved, { key, maxObservations });
  } catch { /* corrupt local memory must never stop the simulator */ }
  return memory;
}

export function persistMarketMemory(memory, storage = null) {
  if (!storage) return false;
  try {
    storage.setItem(memory.key || DEFAULT_KEY, JSON.stringify(memory));
    return true;
  } catch { return false; }
}

function cap(list, max) {
  if (list.length > max) list.splice(0, list.length - max);
}

export function recordObservation(memory, observation) {
  if (!observation?.symbol || !observation?.providerTime) return false;
  const id = `${observation.mode || 'UNKNOWN'}:${observation.symbol}:${observation.providerTime}`;
  if (memory.observations.some((item) => item.id === id)) return false;
  memory.observations.push({
    id,
    ingestedAt: observation.ingestedAt || new Date().toISOString(),
    mode: observation.mode || 'UNKNOWN',
    symbol: observation.symbol,
    providerTime: observation.providerTime,
    price: finite(observation.price),
    bid: finite(observation.bid),
    ask: finite(observation.ask),
    volume: finite(observation.volume),
    score: finite(observation.score),
    action: observation.action || 'WAIT',
    features: observation.features || {},
    regime: observation.regime || null,
  });
  cap(memory.observations, memory.maxObservations);
  return true;
}

export function recordDecision(memory, decision) {
  memory.decisions.push({ id: `${decision.actor}:${decision.symbol}:${decision.providerTime}:${memory.decisions.length}`, ingestedAt: new Date().toISOString(), ...decision });
  cap(memory.decisions, Math.max(1000, Math.floor(memory.maxObservations / 2)));
}

export function recordTrade(memory, trade) {
  memory.trades.push({ id: `${trade.actor}:${trade.side}:${trade.symbol}:${trade.providerTime}:${memory.trades.length}`, ingestedAt: new Date().toISOString(), ...trade });
  cap(memory.trades, 5000);
}

export function recordSourceHealth(memory, health) {
  memory.sourceHealth.push({ ingestedAt: new Date().toISOString(), ...health });
  cap(memory.sourceHealth, 500);
}

export function computeBreadth(items = []) {
  const ready = items.filter((item) => item?.signal?.ready && finite(item.price) !== null);
  if (!ready.length) return { ready: false, count: 0, aboveVwapPct: null, aboveSma20Pct: null, positiveMomentumPct: null, advanceDeclineRatio: null, averageScore: null, leaders: [], laggards: [] };
  const aboveVwap = ready.filter(({ signal, price }) => finite(signal.features?.vwap) !== null && Number(price) > Number(signal.features.vwap)).length;
  const aboveSma20 = ready.filter(({ signal, price }) => finite(signal.features?.sma20) !== null && Number(price) > Number(signal.features.sma20)).length;
  const advances = ready.filter(({ signal }) => Number(signal.features?.momentum5 || 0) > 0).length;
  const declines = ready.filter(({ signal }) => Number(signal.features?.momentum5 || 0) < 0).length;
  const ranked = [...ready].sort((a, b) => Number(b.signal.score || 0) - Number(a.signal.score || 0));
  return {
    ready: true,
    count: ready.length,
    aboveVwapPct: aboveVwap / ready.length,
    aboveSma20Pct: aboveSma20 / ready.length,
    positiveMomentumPct: advances / ready.length,
    advanceDeclineRatio: declines ? advances / declines : advances || 0,
    averageScore: mean(ready.map(({ signal }) => Number(signal.score || 0))),
    leaders: ranked.slice(0, 3).map(({ symbol, signal }) => ({ symbol, score: signal.score })),
    laggards: ranked.slice(-3).reverse().map(({ symbol, signal }) => ({ symbol, score: signal.score })),
  };
}

export function classifyRegime({ benchmarkSignal, breadth }) {
  if (!benchmarkSignal?.ready || !breadth?.ready) return 'INSUFFICIENT_DATA';
  const momentum = Number(benchmarkSignal.features?.momentum20 || 0);
  const vol = Number(benchmarkSignal.features?.realizedVolatility || 0);
  const participation = Number(breadth.aboveSma20Pct || 0);
  if (vol >= 0.012) return momentum >= 0 ? 'HIGH_VOL_RISK_ON' : 'HIGH_VOL_RISK_OFF';
  if (momentum > 0.004 && participation >= 0.6) return 'TRENDING_RISK_ON';
  if (momentum < -0.004 && participation <= 0.4) return 'TRENDING_RISK_OFF';
  return 'RANGE_MIXED';
}

export function memorySummary(memory) {
  const symbols = new Set(memory.observations.map((item) => item.symbol));
  const latest = memory.observations.at(-1) || null;
  return {
    observations: memory.observations.length,
    symbols: symbols.size,
    decisions: memory.decisions.length,
    trades: memory.trades.length,
    regimes: memory.regimes.length,
    latestProviderTime: latest?.providerTime || null,
    latestIngestedAt: latest?.ingestedAt || null,
  };
}

export function clearMarketMemory(memory, storage = null) {
  memory.observations.length = 0;
  memory.decisions.length = 0;
  memory.trades.length = 0;
  memory.experimentRuns.length = 0;
  memory.sourceHealth.length = 0;
  memory.regimes.length = 0;
  if (storage) { try { storage.removeItem(memory.key || DEFAULT_KEY); } catch { /* noop */ } }
}
