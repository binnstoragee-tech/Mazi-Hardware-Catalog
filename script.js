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

/* ── HAMBURGER / MOBILE NAV DRAWER ─────────────────────────────── */
(function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const MOBILE_BP = 900; // keep in sync with the drawer breakpoint in style.css

  if (!hamburger || !navLinks) return;

  function openDrawer() {
    navLinks.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-drawer-open');
  }

  function closeDrawer() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-drawer-open');
    // collapse any open Categories accordion too
    navLinks.querySelectorAll('.nav-has-dropdown.dd-open').forEach(li => li.classList.remove('dd-open'));
  }

  hamburger.addEventListener('click', function () {
    navLinks.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  // Close the drawer when an actual navigation link is tapped
  // (top-level links, category sub-links, "view all", social icons)
  navLinks.querySelectorAll('.nav-link:not(.nav-link-noclick), .nav-dd-item, .nav-dd-footer, .nav-cta-btn').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close menu when clicking outside (also closes via the dimmed backdrop)
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();

/* ── CATEGORIES LINK — hover dropdown on desktop, tap accordion on mobile ── */
(function () {
  const MOBILE_BP = 900;
  document.addEventListener('click', function (e) {
    const link = e.target.closest('.nav-link-noclick');
    if (!link) return;

    if (window.innerWidth <= MOBILE_BP) {
      // Mobile drawer: tapping "Categories" expands/collapses its sublist
      e.preventDefault();
      e.stopPropagation();
      const li = link.closest('.nav-has-dropdown');
      if (li) li.classList.toggle('dd-open');
    } else if (window.innerWidth >= 901) {
      // Desktop: Categories is just a hover target, not a link
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();


/* ── STICKY NAVBAR SCROLL SHADOW ───────────────────────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
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


/* ══════════════════════════════════════════════════════════════════
   NAV SEARCH — suggestions as you type (products + pages)
   ══════════════════════════════════════════════════════════════════ */
(function () {

  /* Product catalog (Home Improvement) — used for live search suggestions */
  var SEARCH_PRODUCTS = [
    { name: "Plain White", desc: "600x1200mm, 600x600mm, 300x300mm | Glossy, Matte | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/2.jpg" },
    { name: "Natural Golden Blue R1", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/3.jpg" },
    { name: "Aurora Grey-1", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/4.jpg" },
    { name: "Arbescato Brown R1", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/5.jpg" },
    { name: "Sunverde Aqua-1", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/6.jpg" },
    { name: "Aedea", desc: "600x600mm, 300x600mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/7.jpg" },
    { name: "Aedea-1", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/8.jpg" },
    { name: "Onyx Roosvelt Ice", desc: "600x600mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/9.jpg" },
    { name: "Onyx Roosvelt Grey", desc: "600x600mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/10.jpg" },
    { name: "Anthracite Crema", desc: "600x600mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/11.jpg" },
    { name: "Anthracite Ivory", desc: "600x600mm | Matte Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/12.jpg" },
    { name: "Megnite Grey", desc: "600x600mm | Matte Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/13.jpg" },
    { name: "Oak Wood Camel", desc: "600x600mm | Matte Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/14.jpg" },
    { name: "Oslo Gris", desc: "600x600mm | Matte Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/15.jpg" },
    { name: "Cento Bianco", desc: "600x600mm | Matte Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/16.jpg" },
    { name: "Orenta Natural", desc: "600x600mm | Matte Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/17.jpg" },
    { name: "Sirrizo Pearl", desc: "600x600mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/18.jpg" },
    { name: "Echo Blue", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/19.jpg" },
    { name: "Dalim Grey", desc: "600x1200mm | Glossy Finish | Indoor/Outdoor", category: "tiles", label: "Tiles", img: "img/tiles catalog/20.jpg" },

    { name: "Glossy", desc: "4 ft Width | 9.5 ft Length | 3mm Thickness", category: "uv-marble", label: "UV Marble Sheets", img: "img/uv marble sheets catalog/2.jpg" },
    { name: "Matte", desc: "4 ft Width | 9.5 ft Length | 3mm Thickness", category: "uv-marble", label: "UV Marble Sheets", img: "img/uv marble sheets catalog/9.jpg" },

    { name: "DS-098", desc: "300 x 8 x 5800mm | Printing Glossy White", category: "ceiling", label: "Ceiling Panel", img: "img/ceiling panel/2.jpg" },
    { name: "DS-217", desc: "300 x 8 x 5800mm | Laminated", category: "ceiling", label: "Ceiling Panel", img: "img/ceiling panel/3.jpg" },
    { name: "DS-001", desc: "300 x 8 x 5800mm | Printing", category: "ceiling", label: "Ceiling Panel", img: "img/ceiling panel/4.jpg" },
    { name: "DS-002", desc: "300 x 8 x 5800mm | Printing", category: "ceiling", label: "Ceiling Panel", img: "img/ceiling panel/5.jpg" },

    { name: "Pinewood", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/2.jpg" },
    { name: "Seirra Oak", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/3.jpg" },
    { name: "Orange", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/4.jpg" },
    { name: "Silver Oak", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/5.jpg" },
    { name: "Hazelnut", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/6.jpg" },
    { name: "Almond White", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/7.jpg" },
    { name: "Black Sesame", desc: "183 x 1220 x 4.5+1mm", category: "parquet", label: "Parquet", img: "img/parquet/8.jpg" },

    { name: "Wall Panel", desc: "2 ft Width | 9.5 ft Length | 3mm Thickness", category: "pvc-wall", label: "PVC Wall Panel", img: "img/pvc wall panel/2.jpg" },

    { name: "B061", desc: "WPC-150 x 23mm x 9.5ft-0", category: "wpc", label: "WPC Wall Panel", img: "img/wpc/2.jpg" },
    { name: "P109", desc: "WPC-150 x 23mm x 9.5ft-0", category: "wpc", label: "WPC Wall Panel", img: "img/wpc/3.jpg" },
    { name: "P104", desc: "WPC-150 x 23mm x 9.5ft-0", category: "wpc", label: "WPC Wall Panel", img: "img/wpc/4.jpg" },
    { name: "M2055", desc: "WPC-150 x 23mm x 9.5ft-0", category: "wpc", label: "WPC Wall Panel", img: "img/wpc/5.jpg" },
    { name: "P133", desc: "WPC-150 x 23mm x 9.5ft-0", category: "wpc", label: "WPC Wall Panel", img: "img/wpc/7.jpg" }
  ];

  /* Site pages — used for live search suggestions */
  var SEARCH_PAGES = [
    { name: "Home", url: "index.html", icon: "ph-house", keywords: "home landing" },
    { name: "Categories", url: "categories.html", icon: "ph-squares-four", keywords: "categories all" },
    { name: "Home Improvement", url: "products.html", icon: "ph-house", keywords: "tiles uv marble ceiling panel parquet pvc wall panel wpc wall panel" },
    { name: "PVC Pipes", url: "pvc-pipes.html", icon: "ph-pipe", keywords: "pipe pipes fittings pressure drainage conduit" },
    { name: "Gutter", url: "gutter.html", icon: "ph-funnel", keywords: "gutter half round box downpipe bracket clip" },
    { name: "Steel Bar", url: "steel-bar.html", icon: "ph-minus-square", keywords: "steel bar rebar round flat hollow section" },
    { name: "Electrical", url: "electrical.html", icon: "ph-lightning", keywords: "electrical cable wire switch breaker led light panel" },
    { name: "Sanitaryware", url: "sanitaryware.html", icon: "ph-toilet", keywords: "sanitaryware toilet basin shower faucet bathtub" },
    { name: "Power Tools", url: "power-tools.html", icon: "ph-wrench", keywords: "power tools drill grinder saw sander hammer" },
    { name: "Plumbing", url: "plumbing.html", icon: "ph-drop", keywords: "plumbing valve fitting tank pump hose" },
    { name: "About", url: "about.html", icon: "ph-info", keywords: "about us company" },
    { name: "Contact", url: "contact.html", icon: "ph-envelope", keywords: "contact whatsapp viber phone email location" }
  ];

  var SUGGESTIONS = ["Tiles", "Ceiling Panel", "Parquet", "PVC Pipes", "Steel Bar", "Sanitaryware"];
  var HISTORY_KEY = "mazi_search_history";
  var HISTORY_MAX = 6;

  var overlay, panel, input, body, closeBtn;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ── search history (per-browser, stored locally) ── */
  function getHistory() {
    try {
      var raw = window.localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveHistory(list) {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function addToHistory(term) {
    term = (term || "").trim();
    if (!term) return;
    var list = getHistory().filter(function (t) { return t.toLowerCase() !== term.toLowerCase(); });
    list.unshift(term);
    if (list.length > HISTORY_MAX) list = list.slice(0, HISTORY_MAX);
    saveHistory(list);
  }

  function removeFromHistory(term) {
    saveHistory(getHistory().filter(function (t) { return t !== term; }));
  }

  function openOverlay() {
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    renderResults("");
    setTimeout(function () { input.focus(); }, 80);
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    input.value = "";
  }

  function goTo(url) {
    window.location.href = url;
  }

  function renderResults(query) {
    var q = query.trim().toLowerCase();

    /* ── empty input: recent searches + quick suggestions ── */
    if (!q) {
      var history = getHistory();
      var html = "";

      if (history.length) {
        html += '<div class="search-section-label">Recent Searches</div>';
        history.forEach(function (term) {
          html +=
            '<div class="search-history-row" data-term="' + escapeHtml(term) + '">' +
            '<i class="ph ph-clock-counter-clockwise search-history-icon"></i>' +
            '<span class="search-history-text">' + escapeHtml(term) + "</span>" +
            '<button type="button" class="search-history-remove" data-remove="' + escapeHtml(term) + '" aria-label="Remove from history"><i class="ph ph-x"></i></button>' +
            "</div>";
        });
      }

      var chips = SUGGESTIONS.map(function (s) {
        return '<button type="button" class="search-chip" data-term="' + escapeHtml(s) + '">' + escapeHtml(s) + "</button>";
      }).join("");
      html +=
        '<div class="search-section-label">Suggestions</div>' +
        '<div class="search-suggestions">' + chips + "</div>";

      body.innerHTML = html;
      bindHistoryRows();
      bindChips();
      return;
    }

    /* ── typing: live text suggestions (autocomplete-style) ── */
    var seen = {};
    var textSuggestions = [];
    SEARCH_PRODUCTS.forEach(function (p) {
      var n = p.name.toLowerCase();
      if (n.indexOf(q) !== -1 && !seen[n]) { seen[n] = true; textSuggestions.push(p.name); }
    });
    SEARCH_PAGES.forEach(function (p) {
      var n = p.name.toLowerCase();
      if (n.indexOf(q) !== -1 && !seen[n]) { seen[n] = true; textSuggestions.push(p.name); }
    });
    textSuggestions = textSuggestions.slice(0, 5);

    var matchedProducts = SEARCH_PRODUCTS.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
             p.desc.toLowerCase().indexOf(q) !== -1 ||
             p.label.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 6);

    var matchedPages = SEARCH_PAGES.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
             p.keywords.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 6);

    if (!textSuggestions.length && !matchedProducts.length && !matchedPages.length) {
      body.innerHTML =
        '<div class="search-empty">' +
        '<i class="ph ph-magnifying-glass-minus"></i>' +
        "<p>No results found for &ldquo;" + escapeHtml(query) + "&rdquo;</p>" +
        "</div>";
      return;
    }

    var html = "";

    if (textSuggestions.length) {
      html += '<div class="search-section-label">Suggestions</div>';
      textSuggestions.forEach(function (s) {
        html +=
          '<div class="search-suggest-row" data-term="' + escapeHtml(s) + '">' +
          '<i class="ph ph-magnifying-glass search-suggest-icon"></i>' +
          "<span>" + escapeHtml(s) + "</span>" +
          "</div>";
      });
    }

    if (matchedProducts.length) {
      html += '<div class="search-section-label">Products</div>';
      matchedProducts.forEach(function (p) {
        html +=
          '<div class="search-result-row" data-cat="' + p.category + '" data-term="' + escapeHtml(p.name) + '">' +
          '<div class="search-result-thumb"><img src="' + p.img + '" alt="' + escapeHtml(p.name) + '" loading="lazy"></div>' +
          '<div class="search-result-text">' +
          '<div class="search-result-name">' + escapeHtml(p.name) + "</div>" +
          '<div class="search-result-desc">' + escapeHtml(p.label) + " &middot; " + escapeHtml(p.desc) + "</div>" +
          "</div></div>";
      });
    }

    if (matchedPages.length) {
      html += '<div class="search-section-label">Pages</div>';
      matchedPages.forEach(function (p) {
        html +=
          '<div class="search-result-row" data-url="' + p.url + '" data-term="' + escapeHtml(p.name) + '">' +
          '<div class="search-result-icon"><i class="ph-fill ' + p.icon + '"></i></div>' +
          '<div class="search-result-text">' +
          '<div class="search-result-name">' + escapeHtml(p.name) + "</div>" +
          "</div></div>";
      });
    }

    body.innerHTML = html;
    bindSuggestRows();
    bindRows();
  }

  function bindChips() {
    body.querySelectorAll(".search-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        input.value = chip.dataset.term;
        addToHistory(chip.dataset.term);
        renderResults(chip.dataset.term);
      });
    });
  }

  function bindHistoryRows() {
    body.querySelectorAll(".search-history-row").forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest(".search-history-remove")) return;
        input.value = row.dataset.term;
        renderResults(row.dataset.term);
      });
    });
    body.querySelectorAll(".search-history-remove").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        removeFromHistory(btn.dataset.remove);
        renderResults("");
      });
    });
  }

  function bindSuggestRows() {
    body.querySelectorAll(".search-suggest-row").forEach(function (row) {
      row.addEventListener("click", function () {
        input.value = row.dataset.term;
        addToHistory(row.dataset.term);
        renderResults(row.dataset.term);
      });
    });
  }

  function bindRows() {
    body.querySelectorAll(".search-result-row").forEach(function (row) {
      row.addEventListener("click", function () {
        addToHistory(row.dataset.term || input.value);
        if (row.dataset.url) {
          goTo(row.dataset.url);
        } else if (row.dataset.cat) {
          goTo("products.html?cat=" + row.dataset.cat);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    overlay = document.getElementById("searchOverlay");
    if (!overlay) return;
    panel = overlay.querySelector(".search-panel");
    input = document.getElementById("searchInput");
    body = document.getElementById("searchBody");
    closeBtn = document.getElementById("searchClose");

    document.querySelectorAll(".nav-search-btn").forEach(function (btn) {
      btn.addEventListener("click", openOverlay);
    });

    closeBtn.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeOverlay();
    });
    input.addEventListener("input", function () {
      renderResults(input.value);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && input.value.trim()) {
        addToHistory(input.value);
        renderResults(input.value);
      }
    });
  });

})();

/* ══════════════════════════════════════════════════════════════════
   GLOBAL SCROLL REVEAL — rise-up animation across the whole site.
   Replays every time an element enters OR leaves the viewport, so it
   animates in on scroll down and again on scroll up.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  var SELECTOR = [
    '.section-header',
    '.lcat-card',
    '.brand-card',
    '.channel-card',
    '.cib-item',
    '.about-img-col',
    '.about-text-col',
    '.highlight-item',
    '.catpage-coming-soon',
    '.prod-card'
  ].join(',');

  document.addEventListener('DOMContentLoaded', function () {
    var els = document.querySelectorAll(SELECTOR);
    if (!els.length) return;

    els.forEach(function (el, i) {
      el.classList.add('reveal-up');
      el.style.transitionDelay = (Math.min(i % 6, 5) * 0.08) + 's';
    });

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.15 });

    els.forEach(function (el) { io.observe(el); });
  });
})();
