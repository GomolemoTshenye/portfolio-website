/* ============================================================
   Gomolemo Tshenye — Portfolio scripts
   Author: Gomolemo Tshenye
   Handles: nav toggle, scroll reveals, typewriter,
   parallax grid, scroll progress, magnetic buttons,
   live clock, contact form, hero word stagger.

   Vanilla JavaScript only — no frameworks/build step, per the
   "HTML, CSS and JavaScript only" requirement. Loaded once at
   the bottom of every page's <body> and self-guards each
   feature with an `if (element exists)` check, so the same
   file works across index/about/projects/contact even though
   not every page has every element (e.g. only contact.html
   has #contact-form).
   ============================================================ */

(function () {
  'use strict';

  // Respect the OS-level "reduce motion" accessibility setting; checked before
  // wiring up any purely decorative animation (glow, magnets, typewriter, parallax)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu (supports the responsive/mobile requirement) ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      // Keep the ARIA state in sync so screen readers announce menu open/closed
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Rotate the hamburger icon into an "X"-ish orientation when open
      const icon = hamburger.querySelector('svg');
      if (icon) icon.style.transform = open ? 'rotate(90deg)' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) — Extra polish ----------
     Watches every .reveal / .reveal-stagger element; once 12% of it scrolls
     into view, adds .visible (CSS then animates opacity/transform) and stops
     observing that element so the animation only plays once per page load.
     Falls back to making everything visible immediately on very old browsers
     that lack IntersectionObserver, so content is never permanently hidden. */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Scroll progress bar — Extra polish ----------
     Computes scrolled-fraction-of-page as a percentage and sets it as the
     bar's width. `ticking` is a requestAnimationFrame guard so the expensive
     scrollHeight/clientHeight read only happens once per frame, not once per
     scroll event (scroll fires far more often than the screen repaints). */
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let ticking = false;
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      progress.style.width = pct + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Parallax grid background — Extra polish ----------
     Moves the fixed dot-grid background up slightly slower than the page
     scrolls (0.18x speed), giving a subtle depth illusion. Skipped entirely
     under prefers-reduced-motion. */
  const grid = document.querySelector('.grid-bg');
  if (grid && !reducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY * 0.18;
          grid.style.transform = `translate3d(0, ${-y}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Cursor-following glow — Extra polish ----------
     The glow eases toward the pointer position rather than snapping to it:
     each frame it moves 8% of the remaining distance (cx/cy lerp toward
     tx/ty), which reads as a soft trailing light. Disabled on touch/narrow
     screens (min-width: 760px) since there's no persistent pointer there. */
  const glow = document.querySelector('.glow');
  if (glow && !reducedMotion && window.matchMedia('(min-width: 760px)').matches) {
    let tx = window.innerWidth / 2, ty = 300;
    let cx = tx, cy = ty;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY + window.scrollY;
    });
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      glow.style.left = cx + 'px';
      glow.style.top = cy + 'px';
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---------- Magnetic buttons — Extra polish ----------
     Nudges each .btn slightly toward the cursor while hovering (12%/18% of
     the offset from center), then snaps back via the CSS transition once the
     pointer leaves. Desktop-only, same reasoning as the glow above. */
  const magnets = document.querySelectorAll('.btn');
  if (!reducedMotion && window.matchMedia('(min-width: 760px)').matches) {
    magnets.forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Typewriter (cycles roles) — Extra polish ----------
     Reads the list of role strings from the [data-typed] element's JSON
     data-attribute (set in index.html), then types/deletes one character at
     a time with a small random delay (70-110ms) so it doesn't feel
     mechanical. `deleting` flips the state machine between typing forward
     and erasing back to 0 chars before moving to the next role (i++, wrapped
     with % roles.length so it loops forever). Falls back to showing just the
     first role as static text when reduced-motion is requested. */
  const typed = document.querySelector('[data-typed]');
  if (typed && !reducedMotion) {
    const roles = JSON.parse(typed.dataset.typed);
    let i = 0, j = 0, deleting = false;
    const tick = () => {
      const word = roles[i];
      typed.textContent = word.slice(0, j);
      if (!deleting && j < word.length) {
        j++;
        setTimeout(tick, 70 + Math.random() * 40);
      } else if (deleting && j > 0) {
        j--;
        setTimeout(tick, 32);
      } else {
        if (!deleting) {
          deleting = true;
          setTimeout(tick, 1600);
        } else {
          deleting = false;
          i = (i + 1) % roles.length;
          setTimeout(tick, 220);
        }
      }
    };
    setTimeout(tick, 900);
  } else if (typed) {
    const roles = JSON.parse(typed.dataset.typed);
    typed.textContent = roles[0];
  }

  /* ---------- Hero h1 word stagger — Extra polish ----------
     Each .word span in the headline gets a slightly later animation-delay
     than the one before it (0.15s base + 0.07s per word index), so the CSS
     `rise` keyframe animation makes the words appear left-to-right in a wave
     instead of all at once. */
  const h1 = document.querySelector('.hero h1');
  if (h1 && h1.querySelectorAll('.word').length) {
    h1.querySelectorAll('.word').forEach((w, idx) => {
      w.style.animationDelay = (0.15 + idx * 0.07) + 's';
    });
  }

  /* ---------- Live clock (Johannesburg) — Extra polish ----------
     Intl.DateTimeFormat with an explicit IANA timeZone keeps the displayed
     time correct for Africa/Johannesburg regardless of the visitor's own
     timezone. Refreshed every 30s (not every second) since minute-precision
     is all the [data-clock] display shows. */
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const update = () => { clock.textContent = fmt.format(new Date()) + ' SAST'; };
    update();
    setInterval(update, 30000);
  }

  /* ---------- REQUIRED: Contact form (client-side feedback) ----------
     This is a static site with no backend/server to POST to, so submission
     is handled entirely in the browser: required-field validation runs
     first (.value.trim() guards against whitespace-only input), then on
     success the form builds a pre-filled `mailto:` link (subject + body
     URL-encoded with encodeURIComponent to safely handle special
     characters) and navigates to it, handing the actual sending off to the
     visitor's own email client — a safe fallback that needs no server. */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();
      const msg = form.querySelector('.form-msg');
      if (!name || !email || !message) {
        msg.textContent = '> please fill all fields';
        msg.style.color = 'var(--danger)';
        msg.classList.add('show');
        return;
      }
      // Open mail client as a safe, working fallback
      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:israeltshenye@gmail.com?subject=${subject}&body=${body}`;
      msg.textContent = '> opening your mail client...';
      msg.style.color = 'var(--success)';
      msg.classList.add('show');
    });
  }

  /* ---------- Active nav link based on filename — Extra polish ----------
     Reads the current page's filename from the URL (defaulting to
     index.html for the bare "/" root) and compares it against each nav
     link's href, adding .active to highlight the matching one. This is why
     every page's nav markup is identical — the active state is computed at
     runtime rather than hardcoded per page. */
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link, .mobile-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

})();
