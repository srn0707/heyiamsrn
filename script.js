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
  const navLinks = document.querySelectorAll('.nav-links a, .nav-links .nav-cv-btn');
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

  /* ---------- gallery lightbox (FLIP expand) ---------- */
  const galleryFigures = document.querySelectorAll('.gallery-grid figure');
  if (galleryFigures.length) {
    let activeLightbox = null;

    const openLightbox = (figure) => {
      if (activeLightbox) return;
      const img = figure.querySelector('img');
      const captionText = figure.querySelector('figcaption')?.textContent || '';
      const startRect = img.getBoundingClientRect();

      const backdrop = document.createElement('div');
      backdrop.className = 'lightbox-backdrop';

      const frame = document.createElement('div');
      frame.className = 'lightbox-frame';
      frame.style.top = `${startRect.top}px`;
      frame.style.left = `${startRect.left}px`;
      frame.style.width = `${startRect.width}px`;
      frame.style.height = `${startRect.height}px`;

      const cloneImg = document.createElement('img');
      cloneImg.src = img.src;
      cloneImg.alt = img.alt;
      frame.appendChild(cloneImg);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'lightbox-close';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.textContent = '×';

      const caption = document.createElement('div');
      caption.className = 'lightbox-caption';
      caption.textContent = captionText;

      document.body.appendChild(backdrop);
      document.body.appendChild(frame);
      document.body.appendChild(closeBtn);
      document.body.appendChild(caption);
      document.body.classList.add('lightbox-open');

      const naturalRatio = (img.naturalWidth || 4) / (img.naturalHeight || 3);
      let targetW = Math.min(window.innerWidth * 0.88, 1200);
      let targetH = targetW / naturalRatio;
      const maxH = window.innerHeight * 0.82;
      if (targetH > maxH) {
        targetH = maxH;
        targetW = targetH * naturalRatio;
      }
      const targetTop = (window.innerHeight - targetH) / 2;
      const targetLeft = (window.innerWidth - targetW) / 2;

      // force layout before animating so the transition starts from startRect
      // eslint-disable-next-line no-unused-expressions
      frame.getBoundingClientRect();

      requestAnimationFrame(() => {
        backdrop.classList.add('open');
        if (!reduceMotion) {
          frame.style.top = `${targetTop}px`;
          frame.style.left = `${targetLeft}px`;
          frame.style.width = `${targetW}px`;
          frame.style.height = `${targetH}px`;
        } else {
          frame.style.transition = 'none';
          frame.style.top = `${targetTop}px`;
          frame.style.left = `${targetLeft}px`;
          frame.style.width = `${targetW}px`;
          frame.style.height = `${targetH}px`;
        }
        closeBtn.classList.add('show');
        if (captionText) caption.classList.add('show');
      });

      const closeLightbox = () => {
        frame.style.top = `${startRect.top}px`;
        frame.style.left = `${startRect.left}px`;
        frame.style.width = `${startRect.width}px`;
        frame.style.height = `${startRect.height}px`;
        backdrop.classList.remove('open');
        closeBtn.classList.remove('show');
        caption.classList.remove('show');

        const cleanup = () => {
          backdrop.remove();
          frame.remove();
          closeBtn.remove();
          caption.remove();
          document.body.classList.remove('lightbox-open');
          document.removeEventListener('keydown', onKeydown);
          activeLightbox = null;
        };
        if (reduceMotion) {
          cleanup();
        } else {
          frame.addEventListener('transitionend', cleanup, { once: true });
        }
      };

      const onKeydown = (e) => {
        if (e.key === 'Escape') closeLightbox();
      };

      backdrop.addEventListener('click', closeLightbox);
      closeBtn.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', onKeydown);

      activeLightbox = { closeLightbox };
    };

    galleryFigures.forEach((figure) => {
      figure.addEventListener('click', () => openLightbox(figure));
    });
  }

  /* ---------- contact form (submits to Formspree) ---------- */
  const form = document.getElementById('contactForm');
  const errorEl = document.getElementById('formError');
  const successBox = document.getElementById('successBox');

  if (form) {
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnLabel = submitBtn ? submitBtn.textContent : '';

    const showError = (message) => {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('f-name').value.trim();
      const email = document.getElementById('f-email').value.trim();
      const message = document.getElementById('f-message').value.trim();

      if (!name || !email || !message) {
        showError('Please fill name, email, and message.');
        return;
      }
      errorEl.classList.add('hidden');

      if (form.action.includes('YOUR_FORM_ID')) {
        showError('Form isn’t connected yet — add your Formspree form ID in index.html.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.classList.add('hidden');
          successBox.classList.remove('hidden');
        } else {
          showError('Something went wrong sending that — please email me directly at shreeyanrijal7@gmail.com.');
        }
      } catch (err) {
        showError('Couldn’t reach the server — please email me directly at shreeyanrijal7@gmail.com.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnLabel;
        }
      }
    });
  }
})();
