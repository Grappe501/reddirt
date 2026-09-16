import { recordDecision, buyPortfolio, sellPortfolio } from './portfolio.js';

export function createAutopilot({ enabled = true, entryScore = 70, exitScore = 46, capitalFraction = 0.7 } = {}) {
  return {
    enabled,
    entryScore,
    exitScore,
    capitalFraction,
    lastKey: null,
    lastAction: 'WAIT',
    lastReason: 'Waiting for enough market context.',
  };
}

export function evaluateAutopilot({ autopilot, portfolio, signal, symbol, price, costs, time, evaluationKey }) {
  if (!autopilot.enabled) return { action: 'OFF', executed: false, reason: 'Autopilot is disabled.' };
  if (!signal?.ready || !(price > 0)) return { action: 'WAIT', executed: false, reason: 'Waiting for sufficient market context.' };
  if (evaluationKey && autopilot.lastKey === evaluationKey) return { action: 'HOLD', executed: false, reason: 'This market state has already been evaluated.' };
  autopilot.lastKey = evaluationKey || `${symbol}:${time}`;

  recordDecision(portfolio, {
    time,
    symbol,
    action: signal.action,
    score: signal.score,
    confidence: signal.confidence,
    reasons: signal.reasons,
    counterEvidence: signal.counterEvidence,
  });

  const pos = portfolio.position;
  if (!pos) {
    if (signal.score < autopilot.entryScore) {
      autopilot.lastAction = 'WAIT';
      autopilot.lastReason = `Score ${signal.score} is below entry threshold ${autopilot.entryScore}.`;
      return { action: 'WAIT', executed: false, reason: autopilot.lastReason };
    }

    const result = buyPortfolio({
      portfolio,
      symbol,
      price,
      costs,
      time,
      reason: `Autopilot entry: evidence score ${signal.score}. ${signal.reasons.join(' ')}`,
      stopPrice: signal.risk?.stopPrice ?? null,
      targetPrice: signal.risk?.targetPrice ?? null,
      maxCapitalFraction: autopilot.capitalFraction,
    });
    autopilot.lastAction = result.ok ? 'BUY' : 'WAIT';
    autopilot.lastReason = result.ok ? `Entered ${result.shares} ${symbol} at score ${signal.score}.` : result.reason;
    return { action: autopilot.lastAction, executed: result.ok, reason: autopilot.lastReason, result };
  }

  if (pos.symbol !== symbol) {
    return { action: 'HOLD', executed: false, reason: `Autopilot is already managing ${pos.symbol}.` };
  }

  const stopHit = Number.isFinite(pos.stopPrice) && price <= pos.stopPrice;
  const targetHit = Number.isFinite(pos.targetPrice) && price >= pos.targetPrice;
  const scoreExit = signal.score <= autopilot.exitScore;
  if (!stopHit && !targetHit && !scoreExit) {
    autopilot.lastAction = 'HOLD';
    autopilot.lastReason = `Holding ${symbol}; score ${signal.score}, stop ${pos.stopPrice?.toFixed?.(2) ?? '--'}, target ${pos.targetPrice?.toFixed?.(2) ?? '--'}.`;
    return { action: 'HOLD', executed: false, reason: autopilot.lastReason };
  }

  const trigger = stopHit ? 'protective stop' : targetHit ? 'profit target' : `evidence score ${signal.score} <= ${autopilot.exitScore}`;
  const result = sellPortfolio({
    portfolio,
    symbol,
    price,
    costs,
    time,
    reason: `Autopilot exit: ${trigger}.`,
  });
  autopilot.lastAction = result.ok ? 'SELL' : 'HOLD';
  autopilot.lastReason = result.ok ? `Exited ${symbol} because ${trigger}. Net ${result.net.toFixed(2)}.` : result.reason;
  return { action: autopilot.lastAction, executed: result.ok, reason: autopilot.lastReason, result };
}
