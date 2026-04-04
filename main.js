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

// ─── PARTICLES ───
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#9B30FF', '#7B2FBE', '#4B0082', '#C084FC'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    const size = Math.random() * 3 + 1;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 12 + 8;
    const delay = Math.random() * 10;
    const xDrift = (Math.random() > 0.5 ? '' : '-') + (Math.random() * 120 + 30);
    p.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      bottom:-10px;
      width:${size}px;
      height:${size}px;
      background:${color};
      border-radius:50%;
      opacity:${Math.random() * 0.25 + 0.05};
      animation:particle-rise ${duration}s ${delay}s infinite linear;
      --drift:${xDrift}px;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particle-rise {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 0.2; }
      100% { transform: translateY(-105vh) translateX(var(--drift)); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
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
