(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CV_PATH = 'Shreeyan_Rijal_CV.pdf';

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

  /* ---------- CV viewer modal ---------- */
  const cvModal = document.getElementById('cvModal');
  const cvModalFrame = document.getElementById('cvModalFrame');
  const cvModalClose = document.getElementById('cvModalClose');
  const viewCvBtn = document.getElementById('viewCvBtn');

  function openCvModal() {
    if (!cvModal || !cvModalFrame) return;
    cvModalFrame.src = CV_PATH;
    cvModal.classList.add('open');
    cvModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCvModal() {
    if (!cvModal || !cvModalFrame) return;
    cvModal.classList.remove('open');
    cvModal.setAttribute('aria-hidden', 'true');
    cvModalFrame.src = '';
    document.body.style.overflow = '';
  }

  if (viewCvBtn) viewCvBtn.addEventListener('click', openCvModal);
  if (cvModalClose) cvModalClose.addEventListener('click', closeCvModal);
  if (cvModal) {
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) closeCvModal();
    });
  }

  /* ---------- gallery lightbox ---------- */
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let galleryItems = [];
  let currentIndex = 0;

  if (galleryGrid) {
    galleryItems = Array.from(galleryGrid.querySelectorAll('figure[data-lightbox]'));
    galleryItems.forEach((fig, idx) => {
      fig.style.cursor = 'zoom-in';
      fig.addEventListener('click', () => openLightbox(idx));
    });
  }

  function showImage(idx) {
    if (!galleryItems.length) return;
    currentIndex = (idx + galleryItems.length) % galleryItems.length;
    const fig = galleryItems[currentIndex];
    const img = fig.querySelector('img');
    const caption = fig.querySelector('figcaption');
    if (lightboxImg && img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption ? caption.textContent : '';
    }
  }

  function openLightbox(idx) {
    if (!lightbox) return;
    showImage(idx);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    }
    if (cvModal && cvModal.classList.contains('open')) {
      if (e.key === 'Escape') closeCvModal();
    }
  });

  /* ---------- contact form (Formspree) ---------- */
  const form = document.getElementById('contactForm');
  const errorEl = document.getElementById('formError');
  const successBox = document.getElementById('successBox');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('f-name').value.trim();
      const email = document.getElementById('f-email').value.trim();
      const message = document.getElementById('f-message').value.trim();

      if (!name || !email || !message) {
        errorEl.textContent = 'Please fill name, email, and message.';
        errorEl.classList.remove('hidden');
        return;
      }
      errorEl.classList.add('hidden');

      const submitBtn = form.querySelector('.submit-btn');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
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
          form.reset();
          form.classList.add('hidden');
          successBox.classList.remove('hidden');
        } else {
          errorEl.textContent = 'Something went wrong sending your message. Please try again or email me directly.';
          errorEl.classList.remove('hidden');
        }
      } catch (err) {
        errorEl.textContent = 'Network error — please check your connection and try again.';
        errorEl.classList.remove('hidden');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
})();
