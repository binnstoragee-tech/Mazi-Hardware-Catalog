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
  // Navbar shadow on scroll
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Back to top button visibility
  backToTop.classList.toggle('visible', window.scrollY > 400);

  // Highlight active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// Hamburger toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


// ================================================================
// 2. SCROLL REVEAL ANIMATION
//    Any element with class "reveal" will animate in when visible
// ================================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for sibling elements
      entry.target.style.transitionDelay = (i * 0.08) + 's';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Observe cards and section items
document.querySelectorAll(
  '.cat-card, .prod-card, .highlight-item, .contact-card, .about-grid > div'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


// ================================================================
// 3. PRODUCT FILTER
//    Called by category buttons and category cards
// ================================================================
function filterCategory(cat) {
  // Update filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const targetBtn = [...document.querySelectorAll('.filter-btn')].find(
    b => b.textContent.trim().toLowerCase().replace(/\s/g, '-') === cat ||
         (cat === 'all' && b.textContent.trim() === 'All')
  );
  if (targetBtn) targetBtn.classList.add('active');

  // Show/hide product cards
  document.querySelectorAll('.prod-card').forEach(card => {
    if (cat === 'all' || card.dataset.category === cat) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  // Scroll to products section smoothly
  if (cat !== 'all') {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


// ================================================================
// 4. DRAG & DROP – LOGO (nav)
// ================================================================
const logoDropZone  = document.getElementById('logoDropZone');
const logoPlaceholder = document.getElementById('logoPlaceholder');
const logoPreview   = document.getElementById('logoPreview');

logoDropZone.addEventListener('dragover', e => {
  e.preventDefault();
  logoDropZone.classList.add('drag-over');
});
logoDropZone.addEventListener('dragleave', () => logoDropZone.classList.remove('drag-over'));
logoDropZone.addEventListener('drop', e => {
  e.preventDefault();
  logoDropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => {
      logoPreview.src = ev.target.result;
      logoPreview.style.display = 'block';
      logoPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

// Also allow click to select file for logo
logoDropZone.addEventListener('click', () => {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      logoPreview.src = ev.target.result;
      logoPreview.style.display = 'block';
      logoPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };
  inp.click();
});


// ================================================================
// 5. DRAG & DROP – HERO BACKGROUND IMAGE
// ================================================================
const heroBgDropZone = document.getElementById('heroBgDropZone');
const heroBgImg      = document.getElementById('heroBgImg');
const heroBgHint     = document.getElementById('heroBgHint');

heroBgDropZone.addEventListener('dragover', e => {
  e.preventDefault();
  heroBgDropZone.classList.add('drag-over');
});
heroBgDropZone.addEventListener('dragleave', () => heroBgDropZone.classList.remove('drag-over'));
heroBgDropZone.addEventListener('drop', e => {
  e.preventDefault();
  heroBgDropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => {
      heroBgImg.src = ev.target.result;
      heroBgImg.style.display = 'block';
      heroBgDropZone.classList.add('has-image');
      heroBgHint.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

// Click on hero to change background
heroBgDropZone.addEventListener('click', () => {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      heroBgImg.src = ev.target.result;
      heroBgImg.style.display = 'block';
      heroBgDropZone.classList.add('has-image');
      heroBgHint.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };
  inp.click();
});


// ================================================================
// 6. DRAG & DROP – CATEGORY CARDS (static drop zones)
//    Each .drop-zone has data-target = id of the <img> inside
// ================================================================
document.querySelectorAll('.drop-zone[data-target]').forEach(zone => {
  const imgId = zone.dataset.target;
  const img   = document.getElementById(imgId);
  const placeholder = zone.querySelector('.cat-placeholder');

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImgToZone(file, img, placeholder);
  });
  zone.addEventListener('click', e => {
    e.stopPropagation();
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = ev => {
      const file = ev.target.files[0];
      if (file) loadImgToZone(file, img, placeholder);
    };
    inp.click();
  });
});


// ================================================================
// 7. DRAG & DROP – PRODUCT CARDS
//    Each .prod-img-wrap can receive an image drop
// ================================================================
document.querySelectorAll('.prod-img-wrap').forEach(wrap => {
  const img         = wrap.querySelector('.prod-img');
  const placeholder = wrap.querySelector('.prod-placeholder');

  wrap.addEventListener('dragover', e => {
    e.preventDefault();
    wrap.classList.add('drag-over');
  });
  wrap.addEventListener('dragleave', () => wrap.classList.remove('drag-over'));
  wrap.addEventListener('drop', e => {
    e.preventDefault();
    wrap.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImgToZone(file, img, placeholder);
  });
  wrap.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = e => {
      const file = e.target.files[0];
      if (file) loadImgToZone(file, img, placeholder);
    };
    inp.click();
  });
});


// ================================================================
// HELPER: Load image file into a drop zone
// ================================================================
function loadImgToZone(file, imgEl, placeholderEl) {
  const reader = new FileReader();
  reader.onload = ev => {
    imgEl.src = ev.target.result;
    imgEl.style.display = 'block';
    if (placeholderEl) placeholderEl.style.display = 'none';
  };
  reader.readAsDataURL(file);
}


// ================================================================
// 8. SMOOTH SCROLL for anchor links (extra safety)
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


// ================================================================
// 9. FILTER BUTTON TEXT NORMALIZATION
//    Maps button text to data-category values
// ================================================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.textContent.trim();
    const map = {
      'All':          'all',
      'Tiles':        'tiles',
      'UV Marble':    'uv-marble',
      'Ceiling Panel':'ceiling',
      'Parquet':      'parquet',
      'PVC Wall Panel':'pvc-wall'
    };
    filterCategory(map[text] || 'all');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
