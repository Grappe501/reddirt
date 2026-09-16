import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMarket } from '../src/market-analytics.js';
import { createPortfolio, performance } from '../src/portfolio.js';
import { createAutopilot, evaluateAutopilot } from '../src/autopilot.js';

function trendBars(count = 40, start = 100, step = 0.35) {
  return Array.from({ length: count }, (_, index) => {
    const open = start + index * step;
    const close = open + step;
    return {
      time: new Date(Date.UTC(2026, 8, 16, 14, 30 + index)).toISOString(),
      open,
      high: close + 0.2,
      low: open - 0.2,
      close,
      volume: index === count - 1 ? 250000 : 100000 + index * 1000,
    };
  });
}

const zeroCosts = () => ({ spread: 0, slippage: 0, commission: 0, sec: 0, taf: 0, total: 0 });

test('market analytics emits a ready evidence score from sufficient bars', () => {
  const bars = trendBars();
  const benchmark = trendBars(40, 100, 0.1);
  const signal = analyzeMarket({ bars, benchmarkBars: benchmark, quote: { bid: 113.9, ask: 114.0 } });
  assert.equal(signal.ready, true);
  assert.ok(signal.score > 50);
  assert.ok(['BUY', 'WAIT'].includes(signal.action));
  assert.ok(signal.features.relativeVolume > 1);
});

test('shadow autopilot can enter and later exit a fictional position', () => {
  const portfolio = createPortfolio('Auto');
  const autopilot = createAutopilot({ entryScore: 70, exitScore: 46, capitalFraction: 0.8 });
  const entrySignal = { ready: true, action: 'BUY', score: 82, confidence: 64, reasons: ['trend'], counterEvidence: [], risk: { stopPrice: 98, targetPrice: 106 } };
  const entered = evaluateAutopilot({ autopilot, portfolio, signal: entrySignal, symbol: 'NVDA', price: 100, costs: zeroCosts, time: '10:00', evaluationKey: '1' });
  assert.equal(entered.executed, true);
  assert.equal(portfolio.position.symbol, 'NVDA');
  assert.ok(portfolio.position.shares > 0);
  assert.ok(portfolio.position.shares < 5);

  const exitSignal = { ready: true, action: 'SELL', score: 30, confidence: 40, reasons: [], counterEvidence: ['weakness'], risk: { stopPrice: 98, targetPrice: 106 } };
  const exited = evaluateAutopilot({ autopilot, portfolio, signal: exitSignal, symbol: 'NVDA', price: 102, costs: zeroCosts, time: '10:05', evaluationKey: '2' });
  assert.equal(exited.executed, true);
  assert.equal(portfolio.position, null);
  assert.ok(performance(portfolio, () => 102).realized > 0);
});

test('autopilot never evaluates the same market state twice', () => {
  const portfolio = createPortfolio('Auto');
  const autopilot = createAutopilot({ entryScore: 70 });
  const signal = { ready: true, action: 'BUY', score: 80, confidence: 60, reasons: ['trend'], counterEvidence: [], risk: { stopPrice: 98, targetPrice: 106 } };
  evaluateAutopilot({ autopilot, portfolio, signal, symbol: 'AAPL', price: 100, costs: zeroCosts, time: '10:00', evaluationKey: 'same' });
  const duplicate = evaluateAutopilot({ autopilot, portfolio, signal, symbol: 'AAPL', price: 100, costs: zeroCosts, time: '10:00', evaluationKey: 'same' });
  assert.equal(duplicate.executed, false);
  assert.equal(duplicate.action, 'HOLD');
});
