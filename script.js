(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('copyrightYear');
  if (yearEl) yearEl.textContent = `© ${new Date().getFullYear()} Shreeyan Rijal. All rights reserved.`;

  /* ---------- mobile menu ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.classList.toggle('open', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = Array.from(navLinks)
    .map((l) => document.getElementById(l.dataset.section))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === entry.target.id));
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- CV tabs ---------- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `panel-${target}`);
      });
    });
  });

  /* ---------- research paper expand ---------- */
  document.querySelectorAll('.paper').forEach((paper) => {
    const btn = paper.querySelector('.expand-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const willExpand = !paper.classList.contains('expanded');
      document.querySelectorAll('.paper.expanded').forEach((p) => p !== paper && p.classList.remove('expanded'));
      paper.classList.toggle('expanded', willExpand);
    });
  });

  /* ---------- contact form ---------- */
  const form = document.getElementById('contactForm');
  const errorEl = document.getElementById('formError');
  const successBox = document.getElementById('successBox');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('f-name').value.trim();
      const email = document.getElementById('f-email').value.trim();
      const message = document.getElementById('f-message').value.trim();

      if (!name || !email || !message) {
        errorEl.classList.remove('hidden');
        return;
      }
      errorEl.classList.add('hidden');
      form.classList.add('hidden');
      successBox.classList.remove('hidden');
      // NOTE: this is a static site — wire this up to a form backend
      // (e.g. Formspree, Netlify Forms) or your own endpoint to actually
      // receive submissions.
    });
  }
})();
