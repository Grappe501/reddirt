import { analyzeMarket } from './market-analytics.js';
import { liveBars, livePrice } from './live-market.js';

const lastCaptureKey = new WeakMap();

export function liveBreadthSignal(store, symbol) {
  const benchmark = symbol === 'SPY' ? 'QQQ' : 'SPY';
  return analyzeMarket({
    bars: liveBars(store, symbol),
    quote: store.market[symbol] || null,
    benchmarkBars: liveBars(store, benchmark),
  });
}

export function liveBreadthSnapshot(store) {
  return store.symbols.map((symbol) => ({
    symbol,
    price: livePrice(store, symbol),
    signal: liveBreadthSignal(store, symbol),
    quote: store.market[symbol] || {},
    providerTime: store.market[symbol]?.quoteTime || store.market[symbol]?.bar?.time || store.fetchedAt || null,
  }));
}

export function liveEvidenceKey(store) {
  return store.symbols.map((symbol) => {
    const row=store.market[symbol]||{};
    return `${symbol}:${row.quoteTime||row.bar?.time||store.fetchedAt||'none'}`;
  }).join('|');
}

export function captureLiveBreadth(runtime, store) {
  const key=liveEvidenceKey(store);
  if(lastCaptureKey.get(runtime)===key)return { skipped:true, reason:'UNCHANGED_PROVIDER_EVIDENCE', key };
  const result=runtime.captureMarket({
    mode: 'LIVE',
    symbols: store.symbols,
    signalFor: (symbol) => liveBreadthSignal(store, symbol),
    priceFor: (symbol) => livePrice(store, symbol),
    quoteFor: (symbol) => {
      const quote = store.market[symbol] || {};
      const bar = quote.bar || liveBars(store, symbol).at(-1) || {};
      return { ...quote, volume: bar.volume };
    },
    providerTimeFor: (symbol) => store.market[symbol]?.quoteTime || store.market[symbol]?.bar?.time || store.fetchedAt || null,
  });
  lastCaptureKey.set(runtime,key);
  return result;
}
