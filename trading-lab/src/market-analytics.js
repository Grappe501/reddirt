const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export function sma(bars, length, key = 'close') {
  const slice = bars.slice(-length);
  if (slice.length < length) return null;
  return average(slice.map((bar) => Number(bar[key] || 0)));
}

export function atr(bars, length = 14) {
  if (bars.length < length + 1) return null;
  const slice = bars.slice(-(length + 1));
  const ranges = [];
  for (let index = 1; index < slice.length; index += 1) {
    const bar = slice[index];
    const prior = slice[index - 1];
    ranges.push(Math.max(
      Number(bar.high) - Number(bar.low),
      Math.abs(Number(bar.high) - Number(prior.close)),
      Math.abs(Number(bar.low) - Number(prior.close)),
    ));
  }
  return average(ranges);
}

export function vwap(bars) {
  let volume = 0;
  let value = 0;
  for (const bar of bars) {
    const barVolume = Number(bar.volume || 0);
    const typical = (Number(bar.high) + Number(bar.low) + Number(bar.close)) / 3;
    volume += barVolume;
    value += typical * barVolume;
  }
  return volume > 0 ? value / volume : null;
}

export function relativeVolume(bars, length = 20) {
  if (bars.length < 2) return null;
  const current = Number(bars.at(-1)?.volume || 0);
  const history = bars.slice(-(length + 1), -1);
  const baseline = average(history.map((bar) => Number(bar.volume || 0)));
  return baseline > 0 ? current / baseline : null;
}

export function realizedVolatility(bars, length = 20) {
  if (bars.length < length + 1) return null;
  const slice = bars.slice(-(length + 1));
  const returns = [];
  for (let index = 1; index < slice.length; index += 1) {
    const prior = Number(slice[index - 1].close || 0);
    const current = Number(slice[index].close || 0);
    if (prior > 0 && current > 0) returns.push(Math.log(current / prior));
  }
  const mean = average(returns);
  const variance = average(returns.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function percentDistance(value, reference) {
  return reference ? (value - reference) / reference : 0;
}

export function analyzeMarket({ bars = [], quote = null, benchmarkBars = [] } = {}) {
  const minimumBars = 30;
  if (bars.length < minimumBars) {
    return {
      ready: false,
      action: 'WAIT',
      score: 50,
      confidence: 0,
      reasons: [`Need ${minimumBars} completed bars; ${bars.length} are available.`],
      counterEvidence: [],
      invalidation: 'Insufficient context for a trade thesis.',
      features: {},
    };
  }

  const last = bars.at(-1);
  const close = Number(last.close || 0);
  const fast = sma(bars, 8);
  const slow = sma(bars, 20);
  const sessionVwap = vwap(bars);
  const rv = relativeVolume(bars, 20) ?? 1;
  const currentAtr = atr(bars, 14) ?? 0;
  const realizedVol = realizedVolatility(bars, 20) ?? 0;
  const momentum5 = bars.length >= 6 ? percentDistance(close, Number(bars.at(-6).close || close)) : 0;
  const momentum20 = bars.length >= 21 ? percentDistance(close, Number(bars.at(-21).close || close)) : 0;
  const benchmarkClose = Number(benchmarkBars.at(-1)?.close || 0);
  const benchmark20 = benchmarkBars.length >= 21
    ? percentDistance(benchmarkClose, Number(benchmarkBars.at(-21).close || benchmarkClose))
    : 0;
  const relativeStrength = momentum20 - benchmark20;
  const bid = Number(quote?.bid || 0);
  const ask = Number(quote?.ask || 0);
  const midpoint = bid > 0 && ask > 0 ? (bid + ask) / 2 : close;
  const spreadBps = bid > 0 && ask > bid && midpoint > 0 ? ((ask - bid) / midpoint) * 10000 : null;

  let score = 50;
  const reasons = [];
  const counterEvidence = [];

  const add = (points, positive, negative) => {
    score += points;
    if (points > 0 && positive) reasons.push(positive);
    if (points < 0 && negative) counterEvidence.push(negative);
  };

  add(close > slow ? 9 : -9, 'Price is above the 20-bar trend baseline.', 'Price is below the 20-bar trend baseline.');
  add(fast > slow ? 8 : -8, 'The 8-bar average is above the 20-bar average.', 'Short-term trend is below the slower trend.');
  add(sessionVwap && close > sessionVwap ? 8 : -8, 'Price is above session VWAP.', 'Price is below session VWAP.');
  add(momentum5 > 0 ? 6 : -6, 'Five-bar momentum is positive.', 'Five-bar momentum is negative.');
  add(momentum20 > 0 ? 7 : -7, 'Twenty-bar momentum is positive.', 'Twenty-bar momentum is negative.');
  add(relativeStrength > 0 ? 6 : -4, 'The symbol is outperforming the benchmark over 20 bars.', 'The symbol is lagging the benchmark over 20 bars.');

  if (rv >= 1.3) add(8, `Relative volume is elevated at ${rv.toFixed(2)}x.`, null);
  else if (rv < 0.75) add(-5, null, `Relative volume is weak at ${rv.toFixed(2)}x.`);

  if (spreadBps !== null) {
    if (spreadBps <= 5) reasons.push(`Quoted spread is tight at ${spreadBps.toFixed(1)} bps.`);
    if (spreadBps >= 15) add(-8, null, `Quoted spread is wide at ${spreadBps.toFixed(1)} bps.`);
  }

  score = clamp(Math.round(score), 0, 100);
  const action = score >= 68 ? 'BUY' : score <= 38 ? 'SELL' : 'WAIT';
  const confidence = clamp(Math.round(Math.abs(score - 50) * 2), 0, 100);
  const stopDistance = Math.max(currentAtr * 1.5, close * 0.004);
  const targetDistance = stopDistance * 1.8;

  return {
    ready: true,
    action,
    score,
    confidence,
    reasons: reasons.slice(0, 5),
    counterEvidence: counterEvidence.slice(0, 4),
    invalidation: action === 'BUY'
      ? `A move below ${(close - stopDistance).toFixed(2)} or a score collapse below 48 invalidates the long thesis.`
      : action === 'SELL'
        ? 'Long exposure should be reduced or avoided while downside evidence dominates.'
        : 'Wait for the evidence score to move outside the neutral zone.',
    risk: {
      stopPrice: Math.max(0.01, close - stopDistance),
      targetPrice: close + targetDistance,
      atr: currentAtr,
    },
    features: {
      close,
      sma8: fast,
      sma20: slow,
      vwap: sessionVwap,
      relativeVolume: rv,
      momentum5,
      momentum20,
      benchmarkMomentum20: benchmark20,
      relativeStrength,
      realizedVolatility: realizedVol,
      spreadBps,
    },
  };
}
