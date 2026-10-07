/* ═══════════════════════════════════════════════════════════════════
   VERITAS Motor — main.js
   Skill: minimalist-ui
   - Nav glassmorphism al scroll
   - IntersectionObserver para reveal (translateY 12px, skill §7)
   - Stagger cascaded via --delay CSS var
   - Inventory filter por data-category
   - Formulario: validación + submit simulado
   - Smooth anchor scroll con offset nav
   - Mobile overlay menu
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. NAV SCROLL GLASSMORPHISM ─────────────────────────────────── */
  const header = document.getElementById('site-header');

  function updateNav () {
    header.classList.toggle('is-scrolled', window.scrollY > 32);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── 2. SCROLL REVEAL — IntersectionObserver (Skill §7) ──────────── */
  // Mark elements for reveal
  const revealTargets = [
    '.hero__copy',
    '.hero__figure',
    '.manifesto__meta',
    '.manifesto__statement',
    '.manifesto__stat',
    '.inventory__head',
    '.vehicle-card',
    '.appraisal__editorial',
    '.appraisal__form-wrap',
    '.footer-brand',
    '.footer-contact',
    '.footer-hours',
  ].join(', ');

  document.querySelectorAll(revealTargets).forEach(function (el, i) {
    el.classList.add('reveal');
    // Stagger: grid children use their CSS --index var; others use loop index
    if (el.classList.contains('vehicle-card') && el.style.getPropertyValue('--index')) {
      el.style.setProperty('--delay', el.style.getPropertyValue('--index'));
      el.dataset.delay = '';
    } else {
      // Light stagger for non-grid elements
      el.style.setProperty('--delay', Math.min(i, 4));
      el.dataset.delay = '';
    }
  });

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    io.observe(el);
  });

  /* ── 3. INVENTORY FILTER ─────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.vehicle-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.filter;

      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      cards.forEach(function (card) {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
      });
    });
  });

  /* ── 4. SMOOTH ANCHOR SCROLL WITH NAV OFFSET ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href   = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  /* ── 5. MOBILE BURGER MENU ───────────────────────────────────────── */
  const burger = document.getElementById('nav-burger');

  burger && burger.addEventListener('click', function () {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    isOpen ? closeMobileMenu() : openMobileMenu();
  });

  function openMobileMenu () {
    if (document.getElementById('mobile-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Menú de navegación');
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:99',
      'background:rgba(251,251,250,0.96)',
      'backdrop-filter:blur(16px)',
      'display:flex;flex-direction:column',
      'align-items:center;justify-content:center',
      'gap:2.5rem',
      'animation:fadeIn 0.22s ease',
    ].join(';');
    overlay.innerHTML = `
      <style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}</style>
      <a href="#inventario" style="font-family:'Instrument Serif',serif;font-size:2.8rem;color:#111;letter-spacing:-0.02em;">Inventario</a>
      <a href="#tasacion"   style="font-family:'Instrument Serif',serif;font-size:2.8rem;color:#111;letter-spacing:-0.02em;">Tasación</a>
      <a href="#contacto"   style="font-family:'Instrument Serif',serif;font-size:2.8rem;color:#111;letter-spacing:-0.02em;">Contacto</a>
      <button id="mobile-close" aria-label="Cerrar menú" style="position:absolute;top:1.25rem;right:1.25rem;background:none;border:none;cursor:pointer;font-size:1.5rem;color:#787774;display:flex;align-items:center;">
        <i class="ph ph-x"></i>
      </button>
    `;
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('mobile-close');
    closeBtn && closeBtn.addEventListener('click', function () {
      closeMobileMenu();
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  function closeMobileMenu () {
    const overlay = document.getElementById('mobile-overlay');
    overlay && overlay.remove();
  }

  /* ── 6. APPRAISAL FORM ───────────────────────────────────────────── */
  const appraisalForm = document.getElementById('appraisal-form');
  const formSuccess   = document.getElementById('form-success');
  const submitBtn     = document.getElementById('appraisal-submit');
  const submitLabel   = document.getElementById('submit-label');

  if (appraisalForm) {
    appraisalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate required inputs
      const required = appraisalForm.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('has-error');
          field.addEventListener('input', function () {
            field.classList.remove('has-error');
          }, { once: true });
        }
      });

      if (!valid) return;

      // Simulate async submission
      submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Enviando…';

      setTimeout(function () {
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Solicitar tasación';
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          // Fade it in with reveal
          formSuccess.classList.add('reveal', 'is-visible');
        }
        appraisalForm.reset();
      }, 1600);
    });
  }

})();
