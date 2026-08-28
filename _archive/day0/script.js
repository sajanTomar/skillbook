/* ============================================================
   SKILLBOOK — script.js
   Day 1: icon set, theme switch, header stepper, scroll state.
   Everything is namespaced on window.Skillbook so later files
   (wizard, reader, quiz) can hook in without globals colliding.
   ============================================================ */
'use strict';

const Skillbook = (() => {

  /* ----------------------------------------------------------
     ICONS — monoline, 24px grid, inherit currentColor
     ---------------------------------------------------------- */
  const ICONS = {
    moon: '<path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7z"/>',
    sun:  '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"/>',
    home: '<path d="M3.6 10.4 12 3.6l8.4 6.8V20a1.2 1.2 0 0 1-1.2 1.2H4.8A1.2 1.2 0 0 1 3.6 20z"/><path d="M9.4 21.2v-7h5.2v7"/>',
  };

  /** Build an inline SVG string for a named icon. */
  function icon(name, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  /** Replace every [data-ico] placeholder in `root` with its SVG. */
  function paintIcons(root = document) {
    root.querySelectorAll('[data-ico]').forEach(el => {
      el.innerHTML = icon(el.dataset.ico, Number(el.dataset.size) || 18);
    });
  }


  /* ----------------------------------------------------------
     THEME — remembered in localStorage, falls back to the OS
     ---------------------------------------------------------- */
  const THEME_KEY = 'skillbook:theme';

  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const btn = document.getElementById('themeBtn');
    if (!btn) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    btn.querySelector('[data-ico]').dataset.ico = theme === 'dark' ? 'sun' : 'moon';
    btn.setAttribute('aria-label', `Switch to ${next} theme`);
    btn.setAttribute('title', `Switch to ${next} theme`);
    paintIcons(btn);
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }


  /* ----------------------------------------------------------
     STEPPER — 0 = landing (nothing active), 1..4 = flow steps
     ---------------------------------------------------------- */
  let currentStep = 0;

  function setStep(step) {
    currentStep = step;
    document.querySelectorAll('.step').forEach(el => {
      const n = Number(el.dataset.step);
      el.classList.toggle('is-active', n === step);
      el.classList.toggle('is-done',   n <  step);
      if (n === step) el.setAttribute('aria-current', 'step');
      else            el.removeAttribute('aria-current');
    });
  }

  function getStep() { return currentStep; }


  /* ----------------------------------------------------------
     HEADER SCROLL STATE
     ---------------------------------------------------------- */
  function watchScroll() {
    const bar = document.getElementById('topbar');
    if (!bar) return;
    const update = () => bar.classList.toggle('is-stuck', window.scrollY > 4);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }


  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  function init() {
    paintIcons();
    applyTheme(getTheme());
    setStep(0);
    watchScroll();

    document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);

    document.getElementById('restartBtn')?.addEventListener('click', () => {
      // Day 1: nothing to lose yet. Once the wizard holds state this will confirm first.
      window.location.href = './index.html';
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  /* public surface for the files we add on later days */
  return { icon, paintIcons, setStep, getStep, toggleTheme };
})();
