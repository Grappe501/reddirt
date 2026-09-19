import './v6-product-shell.css';
import { coachFor, coachMarkup, lessonFor, universityMarkup } from './v6-university-coach.js';
import { dashboardViewModel } from './v6-dashboard-model.js';
import { buildTapeItems, tapeLabel } from './v6-intelligence-tape.js';
import { lobbyMarkup } from './v6-competition-lobby.js';
import { loadWealthBuilderOverview } from './v6-production-data.js';
import { dashboardFirstFrame, marketsMarkup, routeFromLocation, v6ShellMarkup } from './v6-product-shell.js';
import { portfolioMarkup, runScenario, simulationMarkup } from './v6-portfolio-lab.js';
import { researchFloorFromOverview, researchFloorMarkup } from './v6-research-floor.js';

const app = document.querySelector('#app');
let overview = null;
let loading = true;

function dashboardContent(model) {
  if (loading) {
    return dashboardFirstFrame({
      portfolioLive: false,
      attention: ['Connecting Wealth Builder production services…'],
      research: [{ title: 'Loading research organization', summary: 'Checking market, memory, learning and database health.' }],
      learning: 'Your learning history is loading.',
      competition: 'Competition architecture ready; founding cohort is not active.',
    });
  }
  return dashboardFirstFrame(model);
}

function content(route, model) {
  if (route === 'dashboard') return dashboardContent(model);
  if (route === 'markets') return marketsMarkup(model.quotes);
  if (route === 'research') return researchFloorMarkup(researchFloorFromOverview(overview || {}));
  if (route === 'portfolio') {
    return portfolioMarkup({
      cash: 100000,
      positions: [],
      fills: [],
      startingCapital: 100000,
      assigned: false,
    });
  }
  if (route === 'lab') {
    const spy = model.quotes.find((row) => row.symbol === 'SPY') || model.quotes[0];
    const price = spy?.price || 100;
    return simulationMarkup(runScenario({
      symbol: spy?.symbol || 'SPY',
      entryPrice: price,
      shares: 1,
      exitPrices: [price * 1.02, price * 0.98],
      commission: 1,
      spreadBps: 2,
      slippageBps: 2,
    }));
  }
  if (route === 'university') {
    return universityMarkup(lessonFor('evidence', 'GLANCE')) + coachMarkup(coachFor({
      surface: 'dashboard',
      degraded: Boolean(overview?.degraded?.length),
    }));
  }
  if (route === 'competition') {
    const rows = overview?.sources?.competitionLobby?.data?.cohorts;
    return lobbyMarkup(Array.isArray(rows) && rows.length ? rows : [{ id: 'Founding Cohort 001', verifiedHumans: 0 }]);
  }
  return dashboardContent(model);
}

function tapeText(model) {
  if (loading) return 'Connecting production services…';
  const items = buildTapeItems(overview || {});
  return model.tape || tapeLabel(items[0]);
}

function render() {
  const route = routeFromLocation();
  const model = loading ? { quotes: [], tape: 'Connecting production services…' } : dashboardViewModel(overview);
  const status = overview?.status === 'DEGRADED' ? 'DEGRADED · SIMULATION ONLY' : 'SIMULATION ONLY';
  app.innerHTML = v6ShellMarkup({
    route,
    content: content(route, model),
    tape: tapeText(model),
    status,
  });
  app.querySelector('[data-tape-explain]')?.addEventListener('click', () => {
    location.hash = '#/research';
  });
}

async function boot() {
  render();
  overview = await loadWealthBuilderOverview();
  loading = false;
  render();
}

addEventListener('hashchange', render);
boot();
