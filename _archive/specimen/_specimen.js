/* ============================================================================
   SKILLBOOK — _specimen.js   ** TEMPORARY **
   Renders the design-token reference sections. Delete alongside
   css/_specimen.css once Part 1F ships the real page.
   ============================================================================ */
'use strict';

(() => {
  const el = id => document.getElementById(id);
  if (!el('typeScale')) return;                 // specimen markup not on this page

  /* ---- colour swatches ---- */
  document.querySelectorAll('[data-swatches]').forEach(grid => {
    grid.innerHTML = grid.dataset.swatches.split(',').map(role => {
      const token = `--${role.trim()}`;
      return `<div class="chip">
          <div class="fill" style="background:var(${token})"></div>
          <div class="meta">
            <div class="role">${token}</div>
            <div class="val" data-val="${token}">—</div>
          </div>
        </div>`;
    }).join('');
  });

  /* ---- type scale ---- */
  const SIZES = [
    ['--fs-2xs', 'Folio labels, eyebrow caps'],
    ['--fs-xs', 'Meta text and badges'],
    ['--fs-sm', 'Captions, secondary UI'],
    ['--fs-base', 'Buttons and dense UI'],
    ['--fs-md', 'Default interface text'],
    ['--fs-lg', 'Book body copy'],
    ['--fs-xl', 'Wordmark, sub-headings'],
    ['--fs-2xl', 'Section headings'],
    ['--fs-3xl', 'Page titles'],
    ['--fs-4xl', 'Large titles'],
    ['--fs-chapter', 'Chapter openers'],
    ['--fs-display', 'Hero display'],
  ];
  el('typeScale').innerHTML = SIZES.map(([t, use]) => `
    <div class="type-row">
      <span class="type-key">${t}<br><span data-val="${t}" style="opacity:.7">—</span></span>
      <span class="type-sample text-serif" style="font-size:var(${t});line-height:1.2">${use}</span>
    </div>`).join('');

  /* ---- space ---- */
  el('spaceScale').innerHTML = Array.from({ length: 13 }, (_, i) => `--sp-${i + 1}`)
    .map(t => `
      <div class="space-row">
        <span class="space-key">${t.replace('--', '')}</span>
        <span class="space-bar" style="width:var(${t})"></span>
        <span class="text-mono text-muted" style="font-size:var(--fs-xs)" data-val="${t}">—</span>
      </div>`).join('');

  /* ---- radii ---- */
  el('radii').innerHTML = ['--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-xl', '--r-full']
    .map(t => `
      <div class="demo">
        <div class="box" style="border-radius:var(${t})"></div>
        <div class="cap">${t.replace('--', '')}<br><span data-val="${t}">—</span></div>
      </div>`).join('');

  /* ---- shadows ---- */
  el('shadows').innerHTML = ['--shadow-1', '--shadow-2', '--shadow-3', '--shadow-sheet']
    .map(t => `
      <div class="demo">
        <div class="box no-border" style="box-shadow:var(${t});border-radius:var(--r-lg)"></div>
        <div class="cap">${t.replace('--', '')}</div>
      </div>`).join('');

  /* ---- motion ---- */
  const MOTION = [
    ['--dur-fast', '--ease', 'Hovers, small state changes'],
    ['--dur', '--ease', 'The default for almost everything'],
    ['--dur-slow', '--ease-soft', 'Panels, theme changes'],
    ['--dur-page', '--ease', 'Page turns'],
  ];
  el('motion').innerHTML = MOTION.map(([d, e, use]) => `
    <div class="motion-row">
      <span class="motion-key">${d.replace('--', '')}<br><span data-val="${d}" style="opacity:.7">—</span></span>
      <button class="motion-track" type="button" aria-label="Play ${use}">
        <span class="motion-dot" style="transition:left var(${d}) var(${e})"></span>
      </button>
      <span class="text-muted" style="font-size:var(--fs-sm)">${use}</span>
    </div>`).join('');

  el('motion').addEventListener('click', e => {
    const track = e.target.closest('.motion-track');
    if (track) track.classList.toggle('go');
  });

  /* ---- resolved values, refreshed whenever the theme changes ---- */
  function refresh() {
    const live = getComputedStyle(document.documentElement);
    document.querySelectorAll('[data-val]').forEach(node => {
      node.textContent = live.getPropertyValue(node.dataset.val).trim() || '—';
    });
  }
  Skillbook.settings.onChange(refresh);
  refresh();
})();
