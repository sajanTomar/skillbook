/* ============================================================================
   SKILLBOOK — devtools.js
   Builds the floating design-options panel from the settings schema, so adding
   a fourth header variant means one line in app.js and nothing here.

   Shift + D  toggles the panel.
   Development-only — remove this file, devtools.css and the <script> tag once
   the design is locked.
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.devtools = (() => {

  const VISIBLE_KEY = 'skillbook:devtools-open';

  /* Display names for the settings and their values. Anything not listed here
     falls back to the raw value, so a new variant still shows up. */
  const LABELS = {
    header: { title: 'Header', values: { 1: '1', 2: '2', 3: '3' } },
    desk:   { title: 'Desk',   values: { white: 'White', tinted: 'Tinted' } },
    theme:  { title: 'Theme',  values: { light: 'Light', dark: 'Dark' } },
  };

  /* The order rows appear in — most-used at the top. */
  const ORDER = ['header', 'desk', 'theme'];

  let panel;


  /* ------------------------------------------------------------------
     Markup
     ------------------------------------------------------------------ */
  function build() {
    const rows = ORDER.map(key => {
      const schema = Skillbook.settings.schema[key];
      if (!schema) return '';

      const label = LABELS[key] || { title: key, values: {} };
      const buttons = schema.values.map(v => `
        <button type="button" data-key="${key}" data-value="${v}">
          ${label.values[v] || v}
        </button>`).join('');

      return `
        <div class="devtools__row">
          <span class="devtools__label">${label.title}</span>
          <div class="devtools__seg" role="group" aria-label="${label.title}">${buttons}</div>
        </div>`;
    }).join('');

    panel = document.createElement('aside');
    panel.className = 'devtools no-print';
    panel.setAttribute('aria-label', 'Design options');
    panel.innerHTML = `
      <div class="devtools__bar">
        <span class="devtools__title">
          <span data-ico="sliders" data-size="14"></span> Design
        </span>
        <span class="devtools__kbd">⇧D</span>
        <button class="devtools__collapse" type="button"
                aria-label="Collapse design options" aria-expanded="true">
          <span data-ico="chevD" data-size="15"></span>
        </button>
      </div>
      <div class="devtools__body">
        ${rows}
        <div class="devtools__foot">
          <span>Choices are saved</span>
          <button class="devtools__reset" type="button">Reset all</button>
        </div>
      </div>`;

    document.body.appendChild(panel);
    Skillbook.paintIcons(panel);
  }


  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  function syncButtons() {
    panel.querySelectorAll('[data-key]').forEach(btn => {
      const active = Skillbook.settings.get(btn.dataset.key) === btn.dataset.value;
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function setCollapsed(collapsed) {
    panel.classList.toggle('is-closed', collapsed);
    const btn = panel.querySelector('.devtools__collapse');
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.setAttribute('aria-label', collapsed ? 'Expand design options' : 'Collapse design options');
    try { localStorage.setItem(VISIBLE_KEY, collapsed ? 'closed' : 'open'); } catch {}
  }

  function toggleHidden() {
    panel.classList.toggle('is-hidden');
  }


  /* ------------------------------------------------------------------
     Wiring
     ------------------------------------------------------------------ */
  function bind() {
    panel.addEventListener('click', e => {
      const opt = e.target.closest('[data-key]');
      if (opt) {
        Skillbook.settings.set(opt.dataset.key, opt.dataset.value);
        return;
      }
      if (e.target.closest('.devtools__collapse')) {
        setCollapsed(!panel.classList.contains('is-closed'));
        return;
      }
      if (e.target.closest('.devtools__reset')) {
        Skillbook.settings.reset();
      }
    });

    // Settings can change from anywhere; the panel just follows.
    Skillbook.settings.onChange(() => {
      syncButtons();
      Skillbook.paintIcons();          // the theme icon flips with the theme
    });

    document.addEventListener('keydown', e => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !isTyping(e.target)) {
        e.preventDefault();
        toggleHidden();
      }
    });
  }

  function isTyping(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }


  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    build();
    bind();
    syncButtons();

    let saved = 'open';
    try { saved = localStorage.getItem(VISIBLE_KEY) || 'open'; } catch {}
    setCollapsed(saved === 'closed');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return { toggle: toggleHidden };
})();
