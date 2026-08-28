/* ============================================================================
   SKILLBOOK — app.js
   Part 1A: the settings store only. It owns the three design switches
   (theme / desk / header) and writes them onto <html> as data attributes,
   so CSS alone decides what changes.

   Part 1B builds the visible control panel on top of this.
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.settings = (() => {

  const STORAGE_KEY = 'skillbook:settings';

  /* Each setting declares its allowed values and a default.
     Adding a new design variant later means adding one line here. */
  const SCHEMA = {
    theme:  { values: ['light', 'dark'],     fallback: null },  // null = follow the OS
    desk:   { values: ['white', 'tinted'],   fallback: 'tinted' },
    header: { values: ['1', '2', '3'],       fallback: '1' },
    text:   { values: ['sm', 'md', 'lg'],    fallback: 'md' },  // reading size
  };

  let state = {};
  const listeners = new Set();


  /* ------------------------------------------------------------------
     Persistence
     ------------------------------------------------------------------ */
  function read() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};                       // corrupted or storage blocked
    }
  }

  function write() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private browsing — settings just won't survive the session */
    }
  }


  /* ------------------------------------------------------------------
     Resolution
     ------------------------------------------------------------------ */
  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /** The value actually applied to the document, after fallbacks. */
  function resolve(key) {
    const saved = state[key];
    if (SCHEMA[key].values.includes(saved)) return saved;
    if (key === 'theme') return systemTheme();
    return SCHEMA[key].fallback;
  }

  function apply() {
    const root = document.documentElement;
    Object.keys(SCHEMA).forEach(key => { root.dataset[key] = resolve(key); });
  }


  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */
  function get(key) { return resolve(key); }

  function set(key, value) {
    if (!SCHEMA[key]) throw new Error(`Unknown setting "${key}"`);
    if (!SCHEMA[key].values.includes(value)) {
      throw new Error(`"${value}" is not valid for "${key}" — expected one of ${SCHEMA[key].values.join(', ')}`);
    }
    state[key] = value;
    write();
    apply();
    listeners.forEach(fn => fn(key, value));
  }

  /** Flip between the two values of a binary setting. */
  function toggle(key) {
    const [a, b] = SCHEMA[key].values;
    set(key, get(key) === a ? b : a);
    return get(key);
  }

  /** Clear a saved choice and go back to the default / OS preference. */
  function reset(key) {
    if (key) delete state[key];
    else state = {};
    write();
    apply();
    listeners.forEach(fn => fn(key || '*', get(key || 'theme')));
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }


  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  state = read();
  apply();

  // If the user hasn't picked a theme, keep following the OS when it changes.
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => { if (!state.theme) apply(); });

  return { get, set, toggle, reset, onChange, schema: SCHEMA };
})();
