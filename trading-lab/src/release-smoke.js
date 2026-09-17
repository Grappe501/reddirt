export function buttonAccessibleName(tag) {
  const aria = tag.match(/aria-label\s*=\s*(['"])(.*?)\1/i);
  if (aria?.[2]?.trim()) return aria[2].trim();
  const text = tag.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

export function runAccessibilitySmoke({ indexHtml = '', appSource = '', panelsHtml = '' } = {}) {
  const failures = [];
  const page = `${indexHtml}\n${appSource}\n${panelsHtml}`;
  if (!/lang\s*=\s*["']en["']/i.test(indexHtml)) failures.push('index.html is missing lang="en".');
  if (!/<title>/i.test(indexHtml)) failures.push('index.html is missing a title.');
  if (!/<h1[\s>]/i.test(page)) failures.push('Shipped markup is missing a page heading.');
  if (!/aria-live\s*=\s*["']polite["']/i.test(page)) failures.push('No polite live region is present for status updates.');
  if (!/role\s*=\s*["']img["']/i.test(page) || !/aria-label[\s\S]{0,180}chart/i.test(page)) {
    failures.push('Market chart is missing an accessible name.');
  }
  if (!/aria-label\s*=\s*["']Market mode["']/i.test(page)) failures.push('Mode switch is missing an accessible name.');
  const buttons = page.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) || [];
  const unnamed = buttons.filter((tag) => !buttonAccessibleName(tag));
  if (!buttons.length) failures.push('No buttons were found to smoke-test.');
  if (unnamed.length) failures.push(`${unnamed.length} button(s) have no accessible name.`);
  if (!/type\s*=\s*["']button["']/.test(panelsHtml) && !/data-learning="CLOSE"/.test(panelsHtml)) {
    failures.push('Learning close control is missing from production panels.');
  }
  return { ok: failures.length === 0, failures };
}

export function runMobileSmoke({ indexHtml = '', css = '' } = {}) {
  const failures = [];
  if (!/name\s*=\s*["']viewport["']/i.test(indexHtml) || !/width\s*=\s*device-width/i.test(indexHtml)) {
    failures.push('index.html is missing a mobile viewport.');
  }
  if (!/@media\s*\(\s*max-width\s*:\s*(560|520)px\s*\)/.test(css)) failures.push('Shipped CSS has no phone-width breakpoint.');
  if (!/@media\s*\(\s*max-width\s*:\s*(900|980|760)px\s*\)/.test(css)) failures.push('Shipped CSS has no tablet-width breakpoint.');
  if (!/\.workspace[\s\S]{0,220}grid-template-columns\s*:\s*1fr/.test(css)) failures.push('Workspace does not collapse to one column on small screens.');
  if (!/\.actions button[\s\S]{0,220}min-height\s*:\s*44px/.test(css)) failures.push('Primary controls do not declare a 44px mobile touch target.');
  return { ok: failures.length === 0, failures };
}

export function runReleaseSmoke(input = {}) {
  const accessibility = runAccessibilitySmoke(input);
  const mobile = runMobileSmoke(input);
  return {
    ok: accessibility.ok && mobile.ok,
    accessibility,
    mobile,
  };
}
