/* ============================================================================
   SKILLBOOK — reader.js
   Behaviour for the reading page: chapter navigation, reading size, exercise
   answers, bookmarks and keyboard shortcuts.

   Day 1 scope — the chapter content is still static markup. Day 3 swaps the
   body of renderChapter() for generated content; everything else stays.
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.reader = (() => {

  let activeBook = {
    title: 'Python Programming',
    part: 'Part I · Foundations',
    chapters: [
      { n: 1, title: 'Introduction to Python',     done: true  },
      { n: 2, title: 'Your First Program',          done: true  },
      { n: 3, title: 'Working with Data Types',     done: false },
      { n: 4, title: 'Control Flow',                done: false },
      { n: 5, title: 'Functions',                   done: false },
      { n: 6, title: 'Collections',                 done: false },
      { n: 7, title: 'Files and Errors',            done: false },
      { n: 8, title: 'Putting It All Together',     done: false },
    ],
  };

  function loadSavedBook() {
    try {
      const saved = JSON.parse(localStorage.getItem('skillbook:current_book'));
      if (saved && Array.isArray(saved.chapters) && saved.chapters.length > 0) {
        activeBook = {
          title: saved.title || 'Custom Skillbook',
          part: saved.subtitle || saved.kicker || 'Self-Paced Library',
          chapters: saved.chapters.map((c, i) => ({
            n: c.n || i + 1,
            title: c.title || `Chapter ${i + 1}`,
            kicker: c.kicker || `Chapter ${i + 1}`,
            mins: c.mins || 15,
            sections: c.sections || [],
            done: i === 0
          }))
        };
      }
    } catch (e) {
      console.warn('Could not parse saved book from storage:', e);
    }
  }

  let current = 1;
  let toastTimer;


  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  function toast(message) {
    let node = document.querySelector('.toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'toast no-print';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('is-on'), 2200);
  }


  /* ------------------------------------------------------------------
     Chapter navigation
     ------------------------------------------------------------------ */
  function goToChapter(n) {
    if (n < 1 || n > activeBook.chapters.length) return;
    current = n;

    const chapter = activeBook.chapters[n - 1];
    document.querySelectorAll('[data-bind="chapter-title"]')
      .forEach(el => { el.textContent = chapter.title; });
    document.querySelectorAll('[data-bind="chapter-label"]')
      .forEach(el => { el.textContent = `Chapter ${n} · ${chapter.title}`; });
    document.querySelectorAll('[data-bind="chapter-of"]')
      .forEach(el => { el.textContent = `· Ch. ${n} of ${activeBook.chapters.length}`; });

    syncRail();
    syncProgress();
    syncTurnButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDynamicBookHeader() {
    document.querySelectorAll('.hdr1__title').forEach(el => { el.textContent = activeBook.title; });
    document.querySelectorAll('.hdr2__value').forEach(el => {
      el.innerHTML = `${activeBook.title} <small data-bind="chapter-of">· Ch. ${current} of ${activeBook.chapters.length}</small>`;
    });

    const rail = document.querySelector('.rail');
    if (rail) {
      rail.innerHTML = activeBook.chapters.map(c => `
        <button class="rail__tab ${c.done ? 'is-done' : ''}" type="button" data-chapter="${c.n}" title="${c.title}">
          <span>${c.n}</span>
        </button>
      `).join('');
    }
  }

  function syncRail() {
    document.querySelectorAll('.rail__tab').forEach(tab => {
      const n = Number(tab.dataset.chapter);
      const isCurrent = n === current;
      const ch = activeBook.chapters[n - 1];
      if (ch) {
        tab.classList.toggle('is-done', ch.done && !isCurrent);
      }
      if (isCurrent) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
  }

  function syncProgress() {
    const done = activeBook.chapters.filter(c => c.done).length;
    const pct = Math.round((done / activeBook.chapters.length) * 100);

    document.querySelectorAll('[data-bind="progress-bar"]')
      .forEach(el => { el.style.width = pct + '%'; });
    document.querySelectorAll('[data-bind="progress-pct"]')
      .forEach(el => { el.textContent = pct + '%'; });

    document.querySelectorAll('.ring-fg').forEach(circle => {
      const r = Number(circle.getAttribute('r'));
      const c = 2 * Math.PI * r;
      circle.setAttribute('stroke-dasharray', c.toFixed(1));
      circle.setAttribute('stroke-dashoffset', (c * (1 - pct / 100)).toFixed(1));
    });
    document.querySelectorAll('.ring output')
      .forEach(el => { el.textContent = pct; });
  }

  function syncTurnButtons() {
    const prev = document.querySelector('.turn--prev');
    const next = document.querySelector('.turn--next');
    if (prev) prev.disabled = current === 1;
    if (next) next.disabled = current === activeBook.chapters.length;
  }


  /* ------------------------------------------------------------------
     Reading size — cycles small → medium → large → small
     ------------------------------------------------------------------ */
  const SIZE_NAMES = { sm: 'Small', md: 'Medium', lg: 'Large' };

  function cycleTextSize() {
    const order = Skillbook.settings.schema.text.values;
    const next = order[(order.indexOf(Skillbook.settings.get('text')) + 1) % order.length];
    Skillbook.settings.set('text', next);
    toast(`Text size: ${SIZE_NAMES[next]}`);
  }


  /* ------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */
  function bind() {
    document.addEventListener('click', e => {
      const el = e.target;

      const tab = el.closest('.rail__tab');
      if (tab) return goToChapter(Number(tab.dataset.chapter));

      if (el.closest('.turn--prev')) return goToChapter(current - 1);
      if (el.closest('.turn--next')) return goToChapter(current + 1);

      const action = el.closest('[data-action]')?.dataset.action;
      switch (action) {
        case 'theme':    return Skillbook.settings.toggle('theme');
        case 'text':     return cycleTextSize();
        case 'bookmark': return toast('Bookmarked — Chapter ' + current);
        case 'contents': return toast('Contents page: ' + activeBook.title);
        case 'test':     return toast('Chapter tests arrive on Day 4');
        case 'new-book': return window.location.href = 'index.html';
        case 'books':    return toast('Your library arrives on Day 5');
      }

      // exercise answers
      const reveal = el.closest('.exercise__reveal');
      if (reveal) {
        const answer = reveal.nextElementSibling;
        const open = reveal.getAttribute('aria-expanded') === 'true';
        reveal.setAttribute('aria-expanded', String(!open));
        answer.hidden = open;
        reveal.querySelector('.exercise__reveal-text').textContent =
          open ? 'Show answer' : 'Hide answer';
      }
    });

    document.addEventListener('keydown', e => {
      const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowRight') goToChapter(current + 1);
      if (e.key === 'ArrowLeft')  goToChapter(current - 1);
    });
  }


  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    if (!document.querySelector('.sheet')) return;   // not the reading page
    loadSavedBook();
    renderDynamicBookHeader();
    bind();
    goToChapter(1);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return { goToChapter, toast, get book() { return activeBook; } };
})();
