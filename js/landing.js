/* ============================================================================
   SKILLBOOK — landing.js
   Scroll reveal, the rotating placeholder in the hero, and the topic hand-off
   into the intake flow (built on Day 2).
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.landing = (() => {

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  function reveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Stagger siblings so a row arrives as a wave, not a block.
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('is-in'), delay);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });

    items.forEach(el => io.observe(el));
  }


  /* ------------------------------------------------------------------
     Rotating placeholder — shows the breadth of the product without
     making the user read a list.
     ------------------------------------------------------------------ */
  const EXAMPLES = [
    'Python for data analysis',
    'Class 10 Science — CBSE',
    'Thermodynamics for GATE',
    'Tenses in English grammar',
    'UPSC Indian Polity',
    'React interview preparation',
    'Human anatomy — first year MBBS',
    'Personal finance from scratch',
  ];

  function rotatePlaceholder(input) {
    if (!input || reduceMotion) return;

    let index = 0, char = 0, deleting = false;

    (function tick() {
      const word = EXAMPLES[index];
      char += deleting ? -1 : 1;
      input.placeholder = word.slice(0, char);

      let wait = deleting ? 28 : 52;

      if (!deleting && char === word.length) {
        wait = 2000;                       // hold the finished phrase
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        index = (index + 1) % EXAMPLES.length;
        wait = 320;
      }

      // Stop as soon as the user engages — their text is not ours to overwrite.
      if (document.activeElement === input || input.value) {
        input.placeholder = 'What do you want to learn?';
        return;
      }
      setTimeout(tick, wait);
    })();
  }


  /* ------------------------------------------------------------------
     Topic hand-off
     Day 2 replaces the toast with a redirect into the intake flow.
     ------------------------------------------------------------------ */
  function start(topic) {
    const clean = (topic || '').trim();
    if (!clean) {
      document.querySelector('.hero__form input')?.focus();
      return;
    }
    try { sessionStorage.setItem('skillbook:topic', clean); } catch {}
    Skillbook.reader?.toast?.(`“${clean}” — the intake flow arrives on Day 2`);
  }


  /* ------------------------------------------------------------------
     Wiring
     ------------------------------------------------------------------ */
  function bind() {
    const form = document.querySelector('.hero__form');
    const input = form?.querySelector('input');

    form?.addEventListener('submit', e => {
      e.preventDefault();
      start(input.value);
    });

    document.addEventListener('click', e => {
      // Chips and subject cards both feed the hero input.
      const picker = e.target.closest('[data-topic]');
      if (picker && input) {
        input.value = picker.dataset.topic;
        if (!picker.classList.contains('chip')) {
          input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        input.focus();
        return;
      }

      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'theme') Skillbook.settings.toggle('theme');
      if (action === 'start') start(input?.value || '');
    });

    rotatePlaceholder(input);
  }

  function init() {
    if (!document.querySelector('.hero')) return;   // not the landing page
    reveal();
    bind();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return { start };
})();
