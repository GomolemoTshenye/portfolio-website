/* ============================================================
   Gomolemo Tshenye — Portfolio scripts
   Handles: nav toggle, scroll reveals, typewriter,
   parallax grid, scroll progress, magnetic buttons,
   live clock, contact form, hero word stagger.
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      const icon = hamburger.querySelector('svg');
      if (icon) icon.style.transform = open ? 'rotate(90deg)' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
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

  /* ---------- Scroll progress bar ---------- */
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

  /* ---------- Parallax grid background ---------- */
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

  /* ---------- Cursor-following glow ---------- */
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

  /* ---------- Magnetic buttons ---------- */
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

  /* ---------- Typewriter (cycles roles) ---------- */
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

  /* ---------- Hero h1 word stagger ---------- */
  const h1 = document.querySelector('.hero h1');
  if (h1 && h1.querySelectorAll('.word').length) {
    h1.querySelectorAll('.word').forEach((w, idx) => {
      w.style.animationDelay = (0.15 + idx * 0.07) + 's';
    });
  }

  /* ---------- Live clock (Johannesburg) ---------- */
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

  /* ---------- Contact form (client-side feedback) ---------- */
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

  /* ---------- Active nav link based on filename ---------- */
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link, .mobile-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

})();
