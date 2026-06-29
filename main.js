/* ═══════════════════════════════════════════════════
   SUNRISE AUTOMATIZACIONES — main.js
   ═══════════════════════════════════════════════════ */

// ─── NAV ───
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ─── HERO VIDEO ───
// El video pesa ~4MB: en móvil y conexiones lentas/con ahorro de datos
// activado nos quedamos con el poster estático en vez de descargarlo.
(function initHeroVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const saveData = !!(conn && (conn.saveData || /2g/.test(conn.effectiveType || '')));

  if (isMobile || saveData) return; // se queda con el poster

  const tryPlay = () => {
    video.play().then(() => {
      video.classList.add('playing');
    }).catch(() => {
      // Autoplay bloqueado (ej. política del navegador) — mostrar poster
      video.style.opacity = '0.55';
    });
  };

  const source = document.createElement('source');
  source.src = 'assets/hero-video.mp4';
  source.type = 'video/mp4';
  video.appendChild(source);
  video.load();

  if (video.readyState >= 3) {
    tryPlay();
  } else {
    video.addEventListener('canplay', tryPlay, { once: true });
  }

  // Pausar cuando el hero sale del viewport (ahorra batería)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? video.play().catch(() => {}) : video.pause();
    }, { threshold: 0 }).observe(heroSection);
  }
})();

// ─── HERO LOADED (stagger entrance) ───
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.classList.add('hero-loaded');
  });
});

// ─── STAGGER DELAY INIT ───
document.querySelectorAll('[data-delay]').forEach(el => {
  el.style.transitionDelay = el.dataset.delay;
});

// ─── REVEAL ON SCROLL ───
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}
observeReveal();

// ─── FAQ ACCORDION ───
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = btn.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-q.active').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-expanded', false);
      b.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', true);
      answer.classList.add('open');
    }
  });
});

// ─── CANVAS PARTICLES ───
(function initCanvasParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = ['#9B30FF', '#7B2FBE', '#C084FC', '#4B0082'];
  let dots = [], animId;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createDots() {
    dots = [];
    const count = Math.min(30, Math.floor(canvas.width / 25));
    for (let i = 0; i < count; i++) {
      dots.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.8 + 0.6,
        vx:    (Math.random() - 0.5) * 0.35,
        vy:    (Math.random() - 0.5) * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.22 + 0.05
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = canvas.width;
      if (d.x > canvas.width) d.x = 0;
      if (d.y < 0) d.y = canvas.height;
      if (d.y > canvas.height) d.y = 0;

        ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  }

  // Pause when hero scrolls off screen
  const heroSection = document.getElementById('hero');
  const visObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { animId = requestAnimationFrame(draw); }
    else { cancelAnimationFrame(animId); }
  }, { threshold: 0 });
  if (heroSection) visObserver.observe(heroSection);

  resize();
  createDots();
  window.addEventListener('resize', () => { resize(); createDots(); }, { passive: true });
})();

// ─── CONTACT FORM ───
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite"></span>';
    btn.disabled = true;

    // Add spin animation if not present
    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style');
      s.id = 'spin-style';
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    try {
      const data = new FormData(form);
      const action = form.getAttribute('action');

      // If Formspree is not configured yet, simulate success
      if (action.includes('YOUR_FORM_ID')) {
        await new Promise(r => setTimeout(r, 1200));
        form.style.display = 'none';
        formSuccess.style.display = 'block';
        return;
      }

      const res = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.style.display = 'none';
        formSuccess.style.display = 'block';
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { form_id: 'contactForm' });
      } else {
        throw new Error('Error al enviar');
      }
    } catch {
      btn.innerHTML = 'Error — inténtalo de nuevo';
      btn.style.background = '#dc2626';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });
}

// ─── ACTIVE NAV LINK ───
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── SCROLL PROGRESS BAR ───
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });
}

// ─── STICKY CTA BAR ───
const stickyCta = document.getElementById('sticky-cta');
const contactSection = document.getElementById('contacto');
if (stickyCta && contactSection) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const contactTop = contactSection.offsetTop;
    const show = scrollY > 600 && scrollY < contactTop - window.innerHeight * 0.5;
    stickyCta.classList.toggle('visible', show);
  }, { passive: true });
  // Smooth scroll from sticky CTA
  stickyCta.querySelector('a')?.addEventListener('click', e => {
    e.preventDefault();
    contactSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// ─── DYNAMIC FOOTER YEAR ───
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── ANIMATED COUNTERS ───
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const metricasSection = document.getElementById('metricas');
if (metricasSection) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.metrica-num').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  counterObserver.observe(metricasSection);
}

// ─── 3D TILT CARDS ───
(function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MAX_DEG = 8;
  document.querySelectorAll('.service-card, .testimonio-card').forEach(el => {
    el.addEventListener('mouseenter', () => { el.style.transition = 'none'; });
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      el.style.transform = `perspective(800px) rotateX(${-dy * MAX_DEG}deg) rotateY(${dx * MAX_DEG}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = '';
      el.style.transform = '';
    });
  });
})();

// ─── BUTTON RIPPLE ───
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
});

// ─── CUSTOM CURSOR ───
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px,${mouseY}px)`;
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
    if (!lerpActive) { lerpActive = true; requestAnimationFrame(lerpRing); }
  });

  let lerpActive = false;
  function lerpRing() {
    const dx = mouseX - ringX, dy = mouseY - ringY;
    ringX += dx * 0.15;
    ringY += dy * 0.15;
    ring.style.transform = `translate(${ringX}px,${ringY}px)`;
    if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) { lerpActive = false; return; }
    requestAnimationFrame(lerpRing);
  }

  const interactives = 'a, button, .btn, .faq-q, .integration-item, .service-card, .testimonio-card';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  });
})();
