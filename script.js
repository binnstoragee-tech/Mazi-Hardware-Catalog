/* ================================================================
   MAZI HARDWARE – CATALOG WEBSITE JAVASCRIPT
   script.js
   ================================================================ */

// ================================================================
// 1. NAVBAR: scroll effect + active link + hamburger
// ================================================================
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  backToTop.classList.toggle('visible', window.scrollY > 400);

  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


// ================================================================
// 2. SCROLL REVEAL ANIMATION
// ================================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i * 0.08) + 's';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.cat-card, .prod-card, .highlight-item, .contact-card, .about-grid > div'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


// ================================================================
// 3. PRODUCT FILTER — single source of truth via data-filter attr
// ================================================================
function filterCategory(cat) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === cat);
  });
  document.querySelectorAll('.prod-card').forEach(card => {
    const category = card.getAttribute('data-category');
    card.style.display = (cat === 'all' || category === cat) ? '' : 'none';
  });
}


// ================================================================
// 4–7. DRAG & DROP — logo, hero bg, category cards, product cards
// ================================================================

// Helper
function loadImgToZone(file, imgEl, placeholderEl) {
  const reader = new FileReader();
  reader.onload = ev => {
    imgEl.src = ev.target.result;
    imgEl.style.display = 'block';
    if (placeholderEl) placeholderEl.style.display = 'none';
  };
  reader.readAsDataURL(file);
}



// Logo
const logoDropZone    = document.getElementById('logoDropZone');
const logoPlaceholder = document.getElementById('logoPlaceholder');
const logoPreview     = document.getElementById('logoPreview');
makeDragDrop(logoDropZone, logoPreview, logoPlaceholder);

// Hero bg
const heroBgDropZone = document.getElementById('heroBgDropZone');
const heroBgImg      = document.getElementById('heroBgImg');
const heroBgHint     = document.getElementById('heroBgHint');
if (heroBgDropZone && heroBgImg) {
  heroBgDropZone.addEventListener('dragover', e => { e.preventDefault(); heroBgDropZone.classList.add('drag-over'); });
  heroBgDropZone.addEventListener('dragleave', () => heroBgDropZone.classList.remove('drag-over'));
  heroBgDropZone.addEventListener('drop', e => {
    e.preventDefault(); heroBgDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        heroBgImg.src = ev.target.result;
        heroBgImg.style.display = 'block';
        heroBgDropZone.classList.add('has-image');
        if (heroBgHint) heroBgHint.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
}

// Category cards
document.querySelectorAll('.drop-zone[data-target]').forEach(zone => {
  const img = document.getElementById(zone.dataset.target);
  const placeholder = zone.querySelector('.cat-placeholder');
  if (img) makeDragDrop(zone, img, placeholder);
});

// Product cards
document.querySelectorAll('.prod-img-wrap').forEach(wrap => {
  const img = wrap.querySelector('.prod-img');
  const placeholder = wrap.querySelector('.prod-placeholder');
  if (img) makeDragDrop(wrap, img, placeholder);
});


// ================================================================
// 8. SMOOTH SCROLL
// ================================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
