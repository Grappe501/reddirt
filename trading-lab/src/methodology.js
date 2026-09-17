export const METHODOLOGY_COPY = 'All portfolios, trades and performance are simulated. Historical and shadow results do not guarantee future results. Modeled commissions, regulatory fees, spread and slippage may differ from real execution. Strategy research uses held-out windows, baseline comparisons and retained failures to reduce performance chasing. Score reliability metrics are research diagnostics rather than investment probabilities. This release has no real-money order route and no automatic live strategy promotion.';

export const DISCLOSURE_PHRASES = [
  'are simulated',
  'do not guarantee future results',
  'no real-money order route',
  'no automatic live strategy promotion',
];

export function methodologyPanel() {
  return `<section class="panel methodology-panel"><div class="panel-head"><h2>Simulation Methodology</h2><span>EDUCATIONAL</span></div><p>${METHODOLOGY_COPY}</p></section>`;
}

export function disclosuresVisible(html) {
  const text = String(html || '').toLowerCase();
  return DISCLOSURE_PHRASES.every((phrase) => text.includes(phrase.toLowerCase()));
}
