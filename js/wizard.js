/* ============================================================================
   SKILLBOOK — wizard.js
   Part 2B: Multi-Step Adaptive Intake Wizard Logic & Data Dictionary
   ============================================================================ */
'use strict';

window.Skillbook = window.Skillbook || {};

Skillbook.wizard = (() => {

  const AREAS = [
    { id: 'engineering', name: 'Engineering', icon: 'gear', desc: 'Mechanical, Electrical, CS & AI, Civil, Robotics' },
    { id: 'it', name: 'Technology & IT', icon: 'code', desc: 'Programming, Data Science, Web Dev, Cloud & Security' },
    { id: 'science', name: 'Science', icon: 'flask', desc: 'Physics, Chemistry, Biology and Earth Sciences' },
    { id: 'maths', name: 'Mathematics', icon: 'sigma', desc: 'Calculus, Linear Algebra, Statistics and Discrete Math' },
    { id: 'lang', name: 'Languages & Grammar', icon: 'pen', desc: 'English Grammar, Spanish, French, Writing Craft' },
    { id: 'arts', name: 'Arts & Humanities', icon: 'palette', desc: 'History, Philosophy, Literature, Psychology' },
    { id: 'commerce', name: 'Commerce & Business', icon: 'chart', desc: 'Accounting, Finance, Economics, Marketing' },
    { id: 'medical', name: 'Medical & Health', icon: 'pulse', desc: 'Anatomy, Physiology, Pharmacology, Public Health' },
    { id: 'exams', name: 'Competitive Exams', icon: 'target', desc: 'UPSC Polity, GATE Prep, NEET Biology, SAT/GRE' },
    { id: 'life', name: 'Life & Soft Skills', icon: 'sprout', desc: 'Personal Finance, Leadership, Public Speaking' },
  ];

  const BRANCHES = {
    engineering: [
      { id: 'cs_ai', name: 'Computer Science & AI', desc: 'Algorithms, Neural Networks, Systems' },
      { id: 'mech', name: 'Mechanical Engineering', desc: 'Thermodynamics, Fluid Mechanics, CAD' },
      { id: 'elec', name: 'Electrical Engineering', desc: 'Circuits, Power Systems, Signals' },
      { id: 'civil', name: 'Civil & Structural', desc: 'Structures, Concrete, Surveying' },
      { id: 'ece', name: 'Electronics & Comm (ECE)', desc: 'Microprocessors, VLSI, Wireless' },
      { id: 'robotics', name: 'Robotics & Automation', desc: 'Kinematics, ROS, Control Systems' },
      { id: 'chem_eng', name: 'Chemical Engineering', desc: 'Mass Transfer, Process Control' },
    ],
    it: [
      { id: 'web', name: 'Web Development', desc: 'HTML/CSS/JS, React, Node, Fullstack' },
      { id: 'data', name: 'Data Science & ML', desc: 'Python, Pandas, Machine Learning, SQL' },
      { id: 'cloud', name: 'Cloud & DevOps', desc: 'AWS, Docker, Kubernetes, CI/CD' },
      { id: 'security', name: 'Cyber Security', desc: 'Ethical Hacking, Cryptography, Networks' },
    ],
    science: [
      { id: 'physics', name: 'Physics', desc: 'Mechanics, Electromagnetism, Quantum' },
      { id: 'chemistry', name: 'Chemistry', desc: 'Organic, Inorganic, Physical Chem' },
      { id: 'biology', name: 'Biology & Life Sci', desc: 'Genetics, Ecology, Cell Biology' },
    ],
    maths: [
      { id: 'calculus', name: 'Calculus & Analysis', desc: 'Derivatives, Integrals, Differential Eqs' },
      { id: 'algebra', name: 'Algebra & Matrices', desc: 'Linear Algebra, Abstract Algebra' },
      { id: 'stats', name: 'Statistics & Probability', desc: 'Hypothesis Testing, Distributions' },
    ],
    lang: [
      { id: 'eng_grammar', name: 'English Grammar', desc: 'Tenses, Parts of Speech, Punctuation' },
      { id: 'writing', name: 'Writing & Essay Craft', desc: 'Academic Writing, Storytelling' },
      { id: 'foreign', name: 'Foreign Languages', desc: 'Spanish, French, German Vocabulary' },
    ],
    arts: [
      { id: 'history', name: 'World & National History', desc: 'Ancient, Medieval, Modern Era' },
      { id: 'philosophy', name: 'Philosophy & Ethics', desc: 'Logic, Metaphysics, Political Thought' },
      { id: 'psychology', name: 'Psychology', desc: 'Cognitive, Behavioral, Neuropsychology' },
    ],
    commerce: [
      { id: 'accounting', name: 'Financial Accounting', desc: 'Balance Sheets, Journal Entries' },
      { id: 'finance', name: 'Corporate Finance', desc: 'Valuation, Capital Markets, Investments' },
      { id: 'econ', name: 'Micro & Macro Economics', desc: 'Supply/Demand, Monetary Policy' },
    ],
    medical: [
      { id: 'anatomy', name: 'Human Anatomy', desc: 'Organ Systems, Musculoskeletal' },
      { id: 'pharma', name: 'Pharmacology', desc: 'Drug Mechanism, Dosage, Therapy' },
      { id: 'nursing', name: 'Clinical Nursing', desc: 'Patient Care, Diagnostics' },
    ],
    exams: [
      { id: 'upsc', name: 'UPSC Civil Services', desc: 'Indian Polity, History, General Studies' },
      { id: 'gate', name: 'GATE Engineering', desc: 'Branch-specific Syllabus & PYQs' },
      { id: 'neet', name: 'NEET Medical Entrance', desc: 'Physics, Chemistry, Biology Prep' },
    ],
    life: [
      { id: 'finance_life', name: 'Personal Finance', desc: 'Budgeting, Investing, Taxes, Wealth' },
      { id: 'speaking', name: 'Public Speaking', desc: 'Presentation, Pitching, Rhetoric' },
    ]
  };

  let currentStep = 1;
  let state = {
    area: 'engineering',
    branch: 'cs_ai',
    topic: '',
    level: 'intermediate',
    target: 'general',
    chapters: 6,
    tone: 'editorial'
  };

  /* ------------------------------------------------------------------
     DOM Selectors & Render Functions
     ------------------------------------------------------------------ */
  function getModal() { return document.getElementById('wizardModal'); }

  function open(initialTopic = '') {
    const modal = getModal();
    if (!modal) return;
    if (initialTopic) state.topic = initialTopic;

    currentStep = 1;
    renderStep1();
    syncStepIndicator();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function close() {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function syncStepIndicator() {
    document.querySelectorAll('.wizard__step-dot').forEach(dot => {
      const step = Number(dot.dataset.step);
      dot.classList.toggle('is-active', step === currentStep);
      dot.classList.toggle('is-done', step < currentStep);
    });

    document.querySelectorAll('.wizard__step').forEach(stepEl => {
      const step = Number(stepEl.dataset.step);
      stepEl.classList.toggle('is-active', step === currentStep);
    });

    const backBtn = document.getElementById('wizardBackBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    if (backBtn) backBtn.hidden = currentStep === 1;
    if (nextBtn) {
      nextBtn.innerHTML = currentStep === 3
        ? '<span>Generate Book</span> <span data-ico="arrowR" data-size="16"></span>'
        : '<span>Next</span> <span data-ico="arrowR" data-size="16"></span>';
    }
  }

  /* Step 1: Render Area Grid */
  function renderStep1(filterQuery = '') {
    const grid = document.getElementById('wizardAreaGrid');
    if (!grid) return;

    const query = filterQuery.toLowerCase().trim();
    const filtered = AREAS.filter(a => a.name.toLowerCase().includes(query) || a.desc.toLowerCase().includes(query));

    grid.innerHTML = filtered.map(a => `
      <div class="wizard-card ${state.area === a.id ? 'is-selected' : ''}" data-area="${a.id}">
        <div class="wizard-card__hdr">
          <div class="wizard-card__icon"><span data-ico="${a.icon}"></span></div>
          ${state.area === a.id ? '<span data-ico="check" data-size="18"></span>' : ''}
        </div>
        <div class="wizard-card__title">${a.name}</div>
        <div class="wizard-card__desc">${a.desc}</div>
      </div>
    `).join('');

    Skillbook.icons?.paint?.(grid);
  }

  /* Step 2: Render Branch Grid */
  function renderStep2(filterQuery = '') {
    const grid = document.getElementById('wizardBranchGrid');
    if (!grid) return;

    const list = BRANCHES[state.area] || BRANCHES.engineering;
    const query = filterQuery.toLowerCase().trim();
    const filtered = list.filter(b => b.name.toLowerCase().includes(query) || b.desc.toLowerCase().includes(query));

    grid.innerHTML = filtered.map(b => `
      <div class="wizard-card ${state.branch === b.id ? 'is-selected' : ''}" data-branch="${b.id}">
        <div class="wizard-card__hdr">
          <div class="wizard-card__title">${b.name}</div>
          ${state.branch === b.id ? '<span data-ico="check" data-size="18"></span>' : ''}
        </div>
        <div class="wizard-card__desc">${b.desc}</div>
      </div>
    `).join('');

    Skillbook.icons?.paint?.(grid);
  }

  /* Step 3: Populate Topic Form */
  function renderStep3() {
    const topicInput = document.getElementById('wizardTopicInput');
    if (topicInput) topicInput.value = state.topic;
  }

  /* ------------------------------------------------------------------
     Navigation Actions
     ------------------------------------------------------------------ */
  function next() {
    if (currentStep === 1) {
      if (!state.area) return;
      currentStep = 2;
      renderStep2();
    } else if (currentStep === 2) {
      if (!state.branch) return;
      currentStep = 3;
      renderStep3();
    } else if (currentStep === 3) {
      submitPayload();
      return;
    }
    syncStepIndicator();
  }

  function back() {
    if (currentStep > 1) {
      currentStep--;
      syncStepIndicator();
    }
  }

  function submitPayload() {
    const topicInput = document.getElementById('wizardTopicInput');
    if (topicInput) state.topic = topicInput.value.trim();

    if (!state.topic) {
      topicInput?.focus();
      return;
    }

    const payload = { ...state };
    close();

    if (Skillbook.api?.generateBook) {
      Skillbook.api.generateBook(payload);
    } else {
      console.log('Wizard Payload:', payload);
      try { sessionStorage.setItem('skillbook:topic', payload.topic); } catch {}
      window.location.href = 'reader.html';
    }
  }

  /* ------------------------------------------------------------------
     Event Binding
     ------------------------------------------------------------------ */
  function bind() {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-action="start"]')) {
        const heroInput = document.querySelector('.hero__form input');
        open(heroInput?.value || '');
      }

      if (e.target.closest('.wizard-overlay') && !e.target.closest('.wizard-modal')) {
        close();
      }

      const closeBtn = e.target.closest('#wizardCloseBtn');
      if (closeBtn) close();

      const backBtn = e.target.closest('#wizardBackBtn');
      if (backBtn) back();

      const nextBtn = e.target.closest('#wizardNextBtn');
      if (nextBtn) next();

      // Card Selection
      const areaCard = e.target.closest('[data-area]');
      if (areaCard) {
        state.area = areaCard.dataset.area;
        // set default branch for area
        state.branch = (BRANCHES[state.area] || [])[0]?.id || '';
        renderStep1();
      }

      const branchCard = e.target.closest('[data-branch]');
      if (branchCard) {
        state.branch = branchCard.dataset.branch;
        renderStep2();
      }

      // Pill Options (Level, Target, Tone)
      const pill = e.target.closest('.wizard-pill[data-setting]');
      if (pill) {
        const group = pill.dataset.setting;
        const val = pill.dataset.value;
        state[group] = val;
        pill.parentElement.querySelectorAll('.wizard-pill').forEach(p => p.classList.remove('is-selected'));
        pill.classList.add('is-selected');
      }
    });

    // Search inputs inside wizard
    document.addEventListener('input', e => {
      if (e.target.id === 'wizardAreaSearch') renderStep1(e.target.value);
      if (e.target.id === 'wizardBranchSearch') renderStep2(e.target.value);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && getModal()?.classList.contains('is-open')) {
        close();
      }
    });
  }

  function init() {
    bind();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  return { open, close, state };
})();
