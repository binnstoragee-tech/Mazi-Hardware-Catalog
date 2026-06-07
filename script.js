/* ================================================================
   MAZI HARDWARE – script.js
   ================================================================ */

/* ── HAMBURGER / MOBILE NAV ─────────────────────────────────────── */
(function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ── STICKY NAVBAR SCROLL SHADOW ───────────────────────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();


/* ── BACK TO TOP BUTTON ─────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
})();


/* ── FILTER CATEGORY (Products page) ───────────────────────────── */
function filterCategory(cat) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === cat);
  });

  document.querySelectorAll('.prod-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
  });
}

// Auto-filter from URL param e.g. products.html?cat=tiles
(function () {
  const p = new URLSearchParams(window.location.search).get('cat');
  if (p) {
    document.addEventListener('DOMContentLoaded', () => filterCategory(p));
  }
})();


/* ── IMAGE MODAL ────────────────────────────────────────────────── */
function openModal(imgSrc) {
  const modal = document.getElementById('imageModal');
  const img   = document.getElementById('modalImage');
  if (!modal || !img) return;
  img.src = imgSrc;
  modal.style.display = 'flex';
  modal.offsetHeight;
  modal.classList.add('modal-open');
  modal.classList.remove('modal-closing');
  modal.onclick = function (e) { if (e.target === modal) closeModal(); };
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  if (!modal) return;
  modal.classList.add('modal-closing');
  modal.classList.remove('modal-open');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('modal-closing');
  }, 380);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
