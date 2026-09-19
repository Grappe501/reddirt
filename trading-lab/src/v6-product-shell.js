import {escapeHtml as esc} from './v6-production-proof.js';

export const V6_ROUTES = Object.freeze([
  { id: 'dashboard', label: 'WEALTH BUILDER' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'research', label: 'Research' },
  { id: 'markets', label: 'Markets' },
  { id: 'lab', label: 'Lab' },
  { id: 'university', label: 'University' },
  { id: 'competition', label: 'Competition' },
]);

export function queryFromLocation(loc = globalThis.location) {
  const hash = String(loc?.hash || '');
  const q = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  return Object.fromEntries(new URLSearchParams(q));
}

export function routeFromLocation(loc = globalThis.location) {
  const raw = String(loc?.hash || '').replace(/^#\/?/, '').split(/[/?]/)[0];
  return V6_ROUTES.some((r) => r.id === raw) ? raw : 'dashboard';
}

export function hashFor(route, query = {}) {
  if (!V6_ROUTES.some((r) => r.id === route)) throw new Error('unknown Wealth Builder route');
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, String(value));
  }
  const search = params.toString();
  return '#/' + route + (search ? '?' + search : '');
}

export function navigateV6(route, loc = globalThis.location, query = {}) {
  const next = hashFor(route, query);
  if (loc) loc.hash = next;
  return route;
}

export function v6ShellMarkup({
  route = 'dashboard',
  content = '',
  tape = 'Wealth Builder research is standing by.',
  status = 'SIMULATION ONLY',
} = {}) {
  return '<div class="wb-app"><header class="wb-header"><a class="wb-brand" href="#/dashboard"><b>WEALTH BUILDER</b><small>Personal Institutional Investing</small></a><nav class="wb-nav">'
    + V6_ROUTES.map((r) => '<a href="#/' + r.id + '" class="' + (r.id === route ? 'active' : '') + '">' + r.label + '</a>').join('')
    + '</nav><span class="wb-status">' + esc(status) + '</span></header><main class="wb-main">' + content
    + '</main><footer class="wb-tape"><b>WB INTELLIGENCE</b><span>' + esc(tape)
    + '</span><button type="button" data-tape-explain>Explain</button></footer></div>';
}

export function dashboardFirstFrame({
  portfolioValue = 100000,
  returnPct = 0,
  portfolioLive = true,
  quotes = [],
  attention = [],
  research = [],
  learning = 'Continue your next lesson.',
  competition = 'Founding competition not active.',
} = {}) {
  const items = attention.slice(0, 3);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const value = portfolioLive
    ? '<div class="wb-value"><span>Portfolio</span><strong>' + money.format(portfolioValue) + '</strong><em>' + (returnPct >= 0 ? '+' : '') + Number(returnPct).toFixed(2) + '%</em></div>'
    : '<div class="wb-value"><span>Competition portfolio</span><strong>Not assigned</strong><em>Founding cohort has not launched</em></div>';
  const quoteStrip = quotes.length
    ? '<div class="wb-quotes">' + quotes.slice(0, 6).map((q) => '<a href="' + hashFor('research', { symbol: q.symbol }) + '"><span>' + esc(q.symbol) + '</span><strong>' + money.format(q.price) + '</strong></a>').join('') + '</div>'
    : '';
  return '<section class="wb-hero"><p class="wb-kicker">GOOD AFTERNOON</p><h1>Here\'s what matters right now.</h1>' + value + quoteStrip
    + '</section><section class="wb-first-frame">'
    + '<article><a href="#/markets"><span>WHAT NEEDS YOUR ATTENTION</span><h2>' + (items.length ? items.length + ' items' : 'Nothing urgent') + '</h2><p>' + esc(items[0] || 'Your research queue is clear.') + '</p></a></article>'
    + '<article><a href="#/research"><span>WEALTH BUILDER RIGHT NOW</span><h2>' + esc(research[0]?.title || 'Research organization ready') + '</h2><p>' + esc(research[0]?.summary || 'New evidence and view changes will appear here.') + '</p></a></article>'
    + '<article><a href="#/university"><span>LEARN NEXT</span><h2>Build your edge</h2><p>' + esc(learning) + '</p></a></article>'
    + '<article><a href="#/competition"><span>COMPETITION</span><h2>Human vs Wealth Builder AI</h2><p>' + esc(competition) + '</p></a></article>'
    + '</section><section class="wb-depth"><b>Depth when you want it.</b><span>GLANCE → EXPLAIN → LEARN → ADVANCED → RESEARCH → TRY</span></section>';
}

export function marketsMarkup(quotes = []) {
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const rows = quotes.length
    ? quotes.map((q) => '<article><a href="' + hashFor('research', { symbol: q.symbol }) + '"><span>LIVE QUOTE</span><h2>' + esc(q.symbol) + '</h2><p>' + money.format(q.price) + '</p><small>' + esc(q.time || 'Current provider quote') + '</small></a><div class="wb-quote-actions"><a href="' + hashFor('lab', { symbol: q.symbol }) + '">Run a scenario</a></div></article>').join('')
    : '<article><h2>Market snapshot unavailable</h2><p>Wealth Builder will not invent prices. Check market-data health and try again.</p></article>';
  return '<section class="wb-markets"><p class="wb-kicker">MARKETS</p><h1>Live educational quotes.</h1><p>Alpaca IEX market data. These are quotes for research and paper simulation, not brokerage orders.</p>'
    + '<form class="wb-form wb-inline" data-refresh-quotes><button type="submit">Refresh quotes</button></form>'
    + '<div class="wb-first-frame">' + rows + '</div></section>';
}

export function placeholderSurface(route) {
  const r = V6_ROUTES.find((x) => x.id === route);
  return '<section class="wb-placeholder"><p class="wb-kicker">WEALTH BUILDER</p><h1>' + (r?.label || 'Dashboard') + '</h1><p>This production surface is being connected to the engines already built in V1–V5.</p><a href="#/dashboard">Return to dashboard</a></section>';
}
