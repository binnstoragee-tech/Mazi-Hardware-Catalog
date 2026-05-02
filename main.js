/* ============================================================
   MAZI HARDWARE — MAIN JS
   ============================================================ */

/* ------ PRELOADER ------ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pl = document.getElementById('preloader');
    if (pl) pl.classList.add('done');
  }, 1800);
});

/* ------ NAV SCROLL ------ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
}, { passive: true });

/* ------ MOBILE MENU ------ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
}

function closeMobile() {
  if (hamburger) hamburger.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

/* ------ SCROLL REVEAL ------ */
function observeReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

observeReveal();

/* ------ FILTER BUTTONS (Featured section) ------ */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-btn')) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const filter = e.target.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.style.display = '';
        setTimeout(() => card.classList.add('visible'), 20);
      } else {
        card.style.display = 'none';
        card.classList.remove('visible');
      }
    });
  }
});

/* ------ SMOOTH ANCHOR SCROLL ------ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobile();
    }
  });
});

/* ------ STAGGER PRODUCT CARDS on page load ------ */
document.querySelectorAll('.product-card, .cat-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.06}s`;
});

/* ------ PARALLAX HERO ORB ------ */
window.addEventListener('mousemove', (e) => {
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (!orb1 || !orb2) return;

  const xPct = (e.clientX / window.innerWidth - 0.5) * 20;
  const yPct = (e.clientY / window.innerHeight - 0.5) * 20;

  orb1.style.transform = `translate(${xPct}px, ${yPct}px)`;
  orb2.style.transform = `translate(${-xPct * 0.5}px, ${-yPct * 0.5}px)`;
}, { passive: true });

/* ------ NUMBER COUNT-UP Animation ------ */
function countUp(el, target, duration = 1800) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');
  const initial = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = initial + (target - initial) * ease;

    el.textContent = isDecimal
      ? current.toFixed(1)
      : Math.floor(current).toLocaleString();

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(update);
}

// Observe stats for count-up
const statNums = document.querySelectorAll('.stat-num, .astat-num');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.textContent.replace(/[^0-9.]/g, '');
      const num = parseFloat(raw);
      if (!isNaN(num)) countUp(el, num);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => countObserver.observe(el));
