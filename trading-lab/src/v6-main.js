import './v6-product-shell.css';
import {routeFromLocation,v6ShellMarkup,dashboardFirstFrame,placeholderSurface} from './v6-product-shell.js';
const app=document.querySelector('#app');
function content(route){if(route==='dashboard')return dashboardFirstFrame({portfolioValue:100000,attention:['Build your first watchlist and choose what Wealth Builder should investigate.'],research:[{title:'Research organization ready',summary:'Evidence-backed findings, disagreements and view changes will surface here without an agent wall.'}],learning:'Start with how evidence, risk and transaction costs change a decision.',competition:'10 humans + one sealed Wealth Builder AI · 90 days · simulated capital.'});return placeholderSurface(route)}
function render(){const route=routeFromLocation();app.innerHTML=v6ShellMarkup({route,content:content(route),tape:'Market regime · research findings · view changes · risks · active investigations. Evidence, not profit promises.'});app.querySelector('[data-tape-explain]')?.addEventListener('click',()=>{location.hash='#/research'});}
addEventListener('hashchange',render);render();
