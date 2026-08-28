/* ============================================================================
   SKILLBOOK — icons.js
   One monoline set, drawn on a 24px grid. Every icon inherits currentColor and
   sizes from its container, so a button never has to know what shape is inside it.

   Usage:  <span data-ico="search"></span>          → default 16px
           <span data-ico="check" data-size="20">   → explicit size
           Skillbook.icon('plus', 18)               → returns the SVG string
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.icons = (() => {

  const PATHS = {
    /* navigation */
    menu:    '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:   '<path d="M6 6l12 12M18 6L6 18"/>',
    chevL:   '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    chevR:   '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    chevD:   '<path d="M5.5 9.5 12 16l6.5-6.5"/>',
    arrowR:  '<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',

    /* library + book */
    shelf:   '<path d="M4.5 4h4v16h-4zM10.5 4h4v16h-4z"/><path d="M17 4.6l3.4.9-3.6 14.6-3.4-.9z"/>',
    book:    '<path d="M4.2 5.6A2.4 2.4 0 0 1 6.6 3.2H19.4v14.6H6.6a2.4 2.4 0 0 0-2.4 2.4z"/><path d="M4.2 20.2a2.4 2.4 0 0 1 2.4-2.4H19.4"/>',
    list:    '<path d="M4 6.5h16M4 12h16M4 17.5h11"/>',
    mark:    '<path d="M6.5 3.5h11v17l-5.5-4.2-5.5 4.2z"/>',
    type:    '<path d="M4 6.5V5h16v1.5M12 5v14M9 19h6"/>',

    /* actions */
    plus:    '<path d="M12 5v14M5 12h14"/>',
    search:  '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 20.6 20.6"/>',
    check:   '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',

    /* subjects */
    flask:   '<path d="M9.5 3h5M10.5 3v6.4L5.4 17.9A2 2 0 0 0 7.1 21h9.8a2 2 0 0 0 1.7-3.1L13.5 9.4V3"/><path d="M8 14.5h8"/>',
    gear:    '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7M18.6 18.6l-1.7-1.7M7.1 7.1 5.4 5.4"/>',
    code:    '<path d="M8.6 8.4 4.2 12l4.4 3.6M15.4 8.4 19.8 12l-4.4 3.6M13.6 5 10.4 19"/>',
    sigma:   '<path d="M17.5 5h-11l6.4 7-6.4 7h11"/>',
    pen:     '<path d="M3.2 20.8 4.3 16 15.7 4.9a1.9 1.9 0 0 1 2.7 0l.7.7a1.9 1.9 0 0 1 0 2.7L8 19.7l-4.8 1.1z"/><path d="M14.2 6.4 17.6 9.8"/>',
    palette: '<path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 2.1 2.1 0 0 0 1.6-3.5 2.1 2.1 0 0 1 1.6-3.5h2.5a3 3 0 0 0 3-3A8.8 8.8 0 0 0 12 3.2z"/><circle cx="7.6" cy="12.4" r=".9"/><circle cx="9.6" cy="8.4" r=".9"/><circle cx="14.4" cy="7.8" r=".9"/>',
    chart:   '<path d="M4 19.5V4.5M4 19.5h16"/><path d="M8.2 16v-4.2M12.4 16V7.6M16.6 16v-6"/>',
    pulse:   '<path d="M3 12.2h3.6l2-5.2 3 10.4 2.4-6.8 1.4 1.6H21"/>',
    target:  '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
    sprout:  '<path d="M12 21v-6.6"/><path d="M12 14.4c0-3-2.2-4.9-5.1-4.9H5.2v1.4c0 2.7 2.2 4.6 4.9 4.6H12z"/><path d="M12 14.4c0-3.4 2.4-5.9 5.5-5.9h1.3v1.6c0 3.1-2.5 5.3-5.5 5.3H12z"/><path d="M12 8.6V4.2"/>',

    /* theme */
    moon:    '<path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7z"/>',
    sun:     '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"/>',
  };

  /** Build the SVG markup for a named icon. */
  function icon(name, size = 16) {
    const d = PATHS[name];
    if (!d) {
      console.warn(`[icons] no icon named "${name}"`);
      return '';
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  }

  /**
   * Replace every [data-ico] placeholder inside `root`.
   * Safe to call repeatedly — it re-renders rather than appending.
   */
  function paint(root = document) {
    root.querySelectorAll('[data-ico]').forEach(el => {
      let name = el.dataset.ico;

      // One element, two states: the theme button follows the current theme.
      if (name === 'theme') {
        name = document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon';
      }
      el.innerHTML = icon(name, Number(el.dataset.size) || 16);
    });
  }

  return { icon, paint, names: Object.keys(PATHS) };
})();

/* Convenience aliases used across the app. */
Skillbook.icon = Skillbook.icons.icon;
Skillbook.paintIcons = Skillbook.icons.paint;
