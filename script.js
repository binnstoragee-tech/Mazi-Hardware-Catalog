/* ================================================================
   MAZI HARDWARE – script.js
   ================================================================ */

/* ── FONT LOAD — prevent flash/invisible text ───────────────────── */
(function () {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.documentElement.classList.add('fonts-loaded');
    });
  } else {
    document.documentElement.classList.add('fonts-loaded');
  }
})();


/* ══════════════════════════════════════════════════════════════════
   PAGE TRANSITION — iOS FADE + SLIDE
   ══════════════════════════════════════════════════════════════════ */
(function () {

  const overlay = document.createElement('div');
  overlay.id = 'page-transition';
  document.body.appendChild(overlay);

  /* Page load — fade + slide content in.
     Also fires on browser back/forward (bfcache restore), where the
     page can come back with the old "pt-exit" class still stuck on
     <body> (opacity:0 + pointer-events:none) from before we navigated
     away — that's what made the page look frozen/unclickable on back.
     Always clear it first. */
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('pt-exit');
    document.body.classList.add('pt-enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('pt-enter-active');
        setTimeout(() => {
          document.body.classList.remove('pt-enter', 'pt-enter-active');
        }, 720);
      });
    });
  });

  /* Extra safety net: clear pt-exit right before the page is cached
     for bfcache, so even the instant before "pageshow" fires, the
     page isn't left invisible/unclickable if something restores it
     without pageshow running first. */
  window.addEventListener('pagehide', function () {
    document.body.classList.remove('pt-exit');
  });

  /* Link click — fade + slide content out, then navigate */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href
      || href.startsWith('http')
      || href.startsWith('mailto')
      || href.startsWith('tel')
      || href.startsWith('viber')
      || href.startsWith('#')
      || link.target === '_blank'
    ) return;
    e.preventDefault();
    document.body.classList.add('pt-exit');
    setTimeout(() => { window.location.href = href; }, 330);
  });

})();

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


/* ── CATEGORIES LINK — not clickable on desktop ─────────────────── */
(function () {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('.nav-link-noclick');
    if (!link) return;
    if (window.innerWidth >= 901) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
