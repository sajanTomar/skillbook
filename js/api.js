/* ============================================================================
   SKILLBOOK — api.js
   Part 2D: Client-side API integration & Book Generation Loading State
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.api = (() => {

  function showLoadingOverlay(topic) {
    let overlay = document.getElementById('genLoadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'genLoadingOverlay';
      overlay.className = 'wizard-overlay is-open';
      overlay.style.zIndex = '2000';
      overlay.innerHTML = `
        <div class="wizard-modal wizard-loading" style="max-width: 500px;">
          <div class="wizard-loading__spinner"></div>
          <h2 class="wizard__title" style="margin-bottom: 8px;">Compiling Your Book</h2>
          <p class="wizard__sub" id="genLoadingText">Writing Table of Contents for “${topic}”...</p>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      document.getElementById('genLoadingText').textContent = `Writing Table of Contents for “${topic}”...`;
      overlay.classList.add('is-open');
    }
  }

  function hideLoadingOverlay() {
    const overlay = document.getElementById('genLoadingOverlay');
    if (overlay) overlay.classList.remove('is-open');
  }

  async function generateBook(payload) {
    showLoadingOverlay(payload.topic || 'Your Subject');

    try {
      const response = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.syllabus) {
        throw new Error(data.error || 'Failed to generate syllabus');
      }

      // Save generated syllabus to localStorage
      localStorage.setItem('skillbook:current_book', JSON.stringify(data.syllabus));
      localStorage.setItem('skillbook:wizard_payload', JSON.stringify(payload));

      // Redirect to reader
      window.location.href = 'reader.html';

    } catch (err) {
      console.error('Book Generation Error:', err);
      hideLoadingOverlay();
      Skillbook.reader?.toast?.(`Could not generate book: ${err.message}`);
      alert(`Notice: Server issue (${err.message}). Redirecting to reader sample.`);
      window.location.href = 'reader.html';
    }
  }

  return { generateBook };
})();
