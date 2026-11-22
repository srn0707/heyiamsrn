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
    const setMenu = (open) => {
      mobileMenu.classList.toggle('open', open);
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    };
    navToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMenu(false);
        navToggle.focus();
      }
    });
    window.matchMedia('(min-width: 860px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  // 'contact' is observed too (it has no link in the bar) so the last link un-highlights once you reach it
  const sectionIds = Array.from(new Set([...Array.from(navLinks).map((l) => l.dataset.section), 'contact']));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

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

  /* ---------- marquees: keep the loop full on wide screens ----------
     Each track holds one set of items twice (second half = seamless loop).
     On screens wider than one set, the strip ran out of content before the loop
     restarted. Add extra copies to BOTH halves until a half is wider than the
     screen, and scale the duration so the scroll speed stays the same. */
  const fillMarquees = () => {
    const targetW = Math.max(window.innerWidth, (window.screen && window.screen.width) || 0, 1280) * 1.25;
    document.querySelectorAll('.marquee-track, .img-marquee-track').forEach((track) => {
      const kids = Array.from(track.children);
      if (kids.length < 2 || kids.length % 2 !== 0) return;
      const half = kids.length / 2;
      const unit = kids.slice(0, half);
      const unitW = track.scrollWidth / 2;
      if (!unitW) return;
      const copies = Math.ceil(targetW / unitW);
      if (copies <= 1) return;

      const secondHalfStart = kids[half];
      const clone = (node) => {
        const c = node.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        if (c.tagName === 'IMG') c.alt = '';
        return c;
      };
      for (let i = 1; i < copies; i++) unit.forEach((n) => track.insertBefore(clone(n), secondHalfStart));
      for (let i = 1; i < copies; i++) unit.forEach((n) => track.appendChild(clone(n)));

      const base = parseFloat(getComputedStyle(track).animationDuration);
      if (base) track.style.animationDuration = `${base * copies}s`;
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fillMarquees);
  else window.addEventListener('load', fillMarquees);

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
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const activateTab = (btn, moveFocus) => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `panel-${target}`);
    });
    if (moveFocus) btn.focus();
  };
  tabButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(btn, false));
    btn.addEventListener('keydown', (e) => {
      const last = tabButtons.length - 1;
      let next = null;
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      if (next !== null) {
        e.preventDefault();
        activateTab(tabButtons[next], true);
      }
    });
  });

  /* ---------- research paper expand ---------- */
  const setExpanded = (paper, expanded) => {
    paper.classList.toggle('expanded', expanded);
    const btn = paper.querySelector('.expand-btn');
    if (btn) {
      btn.setAttribute('aria-expanded', String(expanded));
      btn.setAttribute('aria-label', expanded ? 'Collapse abstract' : 'Expand abstract');
    }
  };
  document.querySelectorAll('.paper').forEach((paper) => {
    const btn = paper.querySelector('.expand-btn');
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const willExpand = !paper.classList.contains('expanded');
      document.querySelectorAll('.paper.expanded').forEach((p) => p !== paper && setExpanded(p, false));
      setExpanded(paper, willExpand);
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
      closeBtn.focus({ preventScroll: true });

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

      let closing = false;
      const closeLightbox = () => {
        if (closing) return;
        closing = true;
        frame.style.top = `${startRect.top}px`;
        frame.style.left = `${startRect.left}px`;
        frame.style.width = `${startRect.width}px`;
        frame.style.height = `${startRect.height}px`;
        backdrop.classList.remove('open');
        closeBtn.classList.remove('show');
        caption.classList.remove('show');

        let cleaned = false;
        const cleanup = () => {
          if (cleaned) return;
          cleaned = true;
          backdrop.remove();
          frame.remove();
          closeBtn.remove();
          caption.remove();
          document.body.classList.remove('lightbox-open');
          document.removeEventListener('keydown', onKeydown);
          activeLightbox = null;
          figure.focus({ preventScroll: true });
        };
        if (reduceMotion) {
          cleanup();
        } else {
          frame.addEventListener('transitionend', cleanup, { once: true });
          setTimeout(cleanup, 800); // safety net if the transition event never fires
        }
      };

      const onKeydown = (e) => {
        if (e.key === 'Escape') closeLightbox();
        // the close button is the only control in the lightbox, so keep focus on it
        else if (e.key === 'Tab') {
          e.preventDefault();
          closeBtn.focus({ preventScroll: true });
        }
      };

      backdrop.addEventListener('click', closeLightbox);
      closeBtn.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', onKeydown);

      activeLightbox = { closeLightbox };
    };

    galleryFigures.forEach((figure) => {
      const cap = figure.querySelector('figcaption')?.textContent.trim();
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', cap ? `Enlarge photo: ${cap}` : 'Enlarge photo');
      figure.addEventListener('click', () => openLightbox(figure));
      figure.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(figure);
        }
      });
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
      // Formspree rejects malformed addresses, which would surface as a vague "something went wrong".
      // Catch it here so the visitor can fix it and the message actually reaches the inbox.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Please enter a valid email address so I can reply.');
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
