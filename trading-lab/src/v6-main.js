import './v6-product-shell.css';
import { coachFor, coachMarkup, lessonFor, universityMarkup } from './v6-university-coach.js';
import { dashboardViewModel } from './v6-dashboard-model.js';
import { buildTapeItems, tapeLabel } from './v6-intelligence-tape.js';
import { lobbyMarkup, onboardingMarkup, onboardingState } from './v6-competition-lobby.js';
import { loadWealthBuilderOverview } from './v6-production-data.js';
import { dashboardFirstFrame, hashFor, marketsMarkup, queryFromLocation, routeFromLocation, v6ShellMarkup } from './v6-product-shell.js';
import {
  labFormMarkup,
  loadPaperDesk,
  paperDeskMarkup,
  paperDeskOrder,
  paperDeskView,
  runScenario,
  savePaperDesk,
} from './v6-portfolio-lab.js';
import { researchFloorFromOverview, researchWorkspaceMarkup } from './v6-research-floor.js';

const app = document.querySelector('#app');
const IDENTITY_KEY = 'wb-visitor-identity';
const RULES_FINGERPRINT = 'wb-v6-simulation-rules-v1';

const state = {
  overview: null,
  loading: true,
  lab: { symbol: 'SPY', entryPrice: '', shares: '10', exitHigh: '', exitLow: '', commission: '1', spreadBps: '2', slippageBps: '2', result: null },
  paper: loadPaperDesk(),
  paperMessage: '',
  researchSymbol: '',
  onboardingNotice: '',
  identity: null,
};

function quotes() {
  return state.loading ? [] : dashboardViewModel(state.overview).quotes;
}

function quotePrice(symbol) {
  const row = quotes().find((item) => item.symbol === String(symbol || '').toUpperCase());
  return row?.price || 0;
}

function quoteMap() {
  return Object.fromEntries(quotes().map((row) => [row.symbol, row.price]));
}

function visitorIdentityId() {
  try {
    let id = sessionStorage.getItem(IDENTITY_KEY);
    if (!id) {
      id = 'visitor-' + (globalThis.crypto?.randomUUID?.() || String(Date.now()));
      sessionStorage.setItem(IDENTITY_KEY, id);
    }
    return id;
  } catch {
    return 'visitor-local';
  }
}

function prefillFromQuery() {
  const query = queryFromLocation();
  const symbol = String(query.symbol || '').toUpperCase();
  if (symbol) {
    state.researchSymbol = symbol;
    state.lab.symbol = symbol;
    const price = quotePrice(symbol);
    if (price) {
      state.lab.entryPrice = state.lab.entryPrice || String(price.toFixed(2));
      state.lab.exitHigh = state.lab.exitHigh || String((price * 1.02).toFixed(2));
      state.lab.exitLow = state.lab.exitLow || String((price * 0.98).toFixed(2));
    }
  }
}

function universityLesson() {
  const query = queryFromLocation();
  return lessonFor(query.concept || 'evidence', query.depth || 'GLANCE');
}

function symbolResearch(symbol) {
  if (!symbol) return null;
  const price = quotePrice(symbol);
  return {
    posture: price ? 'WATCH' : 'INCOMPLETE',
    quote: price ? `${symbol} ${price.toFixed(2)} · simulation quote` : '',
    bull: price ? [`Live IEX quote is available for ${symbol}. That is a price, not a thesis.`] : [],
    bear: ['A quote is not evidence of undervaluation or overvaluation.'],
    invalidation: 'Do not treat a single print as a research conclusion.',
  };
}

function dashboardContent(model) {
  if (state.loading) {
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

function withCoach(route, html) {
  return html + coachMarkup(coachFor({
    surface: route,
    degraded: Boolean(state.overview?.degraded?.length),
  }));
}

function content(route, model) {
  if (route === 'dashboard') return dashboardContent(model);
  if (route === 'markets') return marketsMarkup(model.quotes);
  if (route === 'research') {
    return withCoach('research', researchWorkspaceMarkup(researchFloorFromOverview(state.overview || {}), {
      symbol: state.researchSymbol,
      research: symbolResearch(state.researchSymbol),
    }));
  }
  if (route === 'portfolio') {
    const query = queryFromLocation();
    return withCoach('portfolio', paperDeskMarkup(paperDeskView(state.paper, quoteMap()), {
      symbol: query.symbol || state.lab.symbol,
      price: quotePrice(query.symbol || state.lab.symbol) || '',
      message: state.paperMessage,
    }));
  }
  if (route === 'lab') {
    return withCoach('lab', labFormMarkup(state.lab));
  }
  if (route === 'university') {
    return universityMarkup(universityLesson()) + coachMarkup(coachFor({
      surface: 'dashboard',
      degraded: Boolean(state.overview?.degraded?.length),
    }));
  }
  if (route === 'competition') {
    const rows = state.overview?.sources?.competitionLobby?.data?.cohorts;
    const identity = state.identity || state.overview?.sources?.competitionIdentity?.data?.identity;
    const onboarding = onboardingState({
      invitationValid: Boolean(identity?.invitationValid),
      emailVerified: Boolean(identity?.emailVerified),
      phoneVerified: Boolean(identity?.phoneVerified),
      username: identity?.username,
      rulesAccepted: Boolean(identity?.rulesAccepted),
    });
    return onboardingMarkup(onboarding, state.onboardingNotice) + lobbyMarkup(Array.isArray(rows) && rows.length ? rows : [{ id: 'Founding Cohort 001', verifiedHumans: 0 }]);
  }
  return dashboardContent(model);
}

function tapeText(model) {
  if (state.loading) return 'Connecting production services…';
  const items = buildTapeItems(state.overview || {});
  return model.tape || tapeLabel(items[0]);
}

function render() {
  prefillFromQuery();
  const route = routeFromLocation();
  const model = state.loading ? { quotes: [], tape: 'Connecting production services…' } : dashboardViewModel(state.overview);
  const status = state.overview?.status === 'DEGRADED' ? 'DEGRADED · SIMULATION ONLY' : 'SIMULATION ONLY';
  app.innerHTML = v6ShellMarkup({
    route,
    content: content(route, model),
    tape: tapeText(model),
    status,
  });
}

async function refreshOverview() {
  state.overview = await loadWealthBuilderOverview();
  state.loading = false;
  render();
}

async function claimInvitation(form) {
  const body = {
    identityId: visitorIdentityId(),
    inviteId: String(form.inviteId?.value || '').trim(),
    username: String(form.username?.value || '').trim(),
    emailHandle: String(form.emailHandle?.value || '').trim(),
    phoneHandle: String(form.phoneHandle?.value || '').trim(),
    emailVerified: false,
    phoneVerified: false,
    rulesAccepted: Boolean(form.rulesAccepted?.checked),
    rulesFingerprint: form.rulesAccepted?.checked ? RULES_FINGERPRINT : '',
  };
  const res = await fetch('/.netlify/functions/competition-identity-bind', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    state.onboardingNotice = data.message || 'Invitation was not accepted.';
    render();
    return;
  }
  state.identity = data.identity || null;
  state.onboardingNotice = data.identity
    ? 'Invitation bound. Email and phone still require verification. This is not a founding seat and does not launch the cohort.'
    : 'Request received.';
  render();
}

function bind() {
  app.addEventListener('click', (event) => {
    const tape = event.target.closest('[data-tape-explain]');
    if (tape) {
      location.hash = '#/research';
      return;
    }
    const depth = event.target.closest('[data-depth]');
    if (depth) {
      event.preventDefault();
      location.hash = hashFor('university', {
        concept: queryFromLocation().concept || 'evidence',
        depth: depth.getAttribute('data-depth'),
      });
      return;
    }
    const concept = event.target.closest('[data-concept]');
    if (concept) {
      event.preventDefault();
      location.hash = hashFor('university', {
        concept: concept.getAttribute('data-concept'),
        depth: queryFromLocation().depth || 'GLANCE',
      });
    }
  });

  app.addEventListener('submit', async (event) => {
    const lab = event.target.closest('[data-lab-form]');
    if (lab) {
      event.preventDefault();
      const data = new FormData(lab);
      state.lab = {
        symbol: String(data.get('symbol') || 'SPY').toUpperCase(),
        entryPrice: String(data.get('entryPrice') || ''),
        shares: String(data.get('shares') || ''),
        exitHigh: String(data.get('exitHigh') || ''),
        exitLow: String(data.get('exitLow') || ''),
        commission: String(data.get('commission') || '0'),
        spreadBps: String(data.get('spreadBps') || '0'),
        slippageBps: String(data.get('slippageBps') || '0'),
        result: runScenario({
          symbol: String(data.get('symbol') || 'SPY').toUpperCase(),
          entryPrice: data.get('entryPrice'),
          shares: data.get('shares'),
          exitPrices: [data.get('exitHigh'), data.get('exitLow')],
          commission: data.get('commission'),
          spreadBps: data.get('spreadBps'),
          slippageBps: data.get('slippageBps'),
        }),
      };
      render();
      return;
    }

    const paper = event.target.closest('[data-paper-form]');
    if (paper) {
      event.preventDefault();
      const data = new FormData(paper);
      try {
        state.paper = savePaperDesk(paperDeskOrder(state.paper, {
          side: data.get('side'),
          symbol: data.get('symbol'),
          quantity: data.get('quantity'),
          price: data.get('price') || quotePrice(data.get('symbol')),
        }));
        state.paperMessage = 'Paper fill recorded. Simulation only.';
      } catch (error) {
        state.paperMessage = error instanceof Error ? error.message : 'Paper fill failed.';
      }
      render();
      return;
    }

    const research = event.target.closest('[data-research-form]');
    if (research) {
      event.preventDefault();
      const symbol = String(new FormData(research).get('symbol') || '').toUpperCase();
      location.hash = hashFor('research', { symbol });
      return;
    }

    const refresh = event.target.closest('[data-refresh-quotes]');
    if (refresh) {
      event.preventDefault();
      await refreshOverview();
      return;
    }

    const onboarding = event.target.closest('[data-onboarding-form]');
    if (onboarding) {
      event.preventDefault();
      await claimInvitation(onboarding);
    }
  });
}

addEventListener('hashchange', render);
bind();
render();
refreshOverview();
