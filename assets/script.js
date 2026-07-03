/* ============================================================
   BelvoirCare — interactivity
   Theme (light/dark/system), mobile nav, scroll reveal,
   animated counters, scrollspy, sticky header, form handling
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme: light / dark / system ---------- */
  var THEME_KEY = 'bc-theme';
  var modes = ['light', 'dark', 'system'];
  var labels = { light: 'Light', dark: 'Dark', system: 'System' };
  var toggle = document.getElementById('themeToggle');
  var mql = window.matchMedia('(prefers-color-scheme: dark)');

  function getPref() {
    try { return localStorage.getItem(THEME_KEY) || 'system'; } catch (e) { return 'system'; }
  }
  function resolve(pref) {
    return pref === 'system' ? (mql.matches ? 'dark' : 'light') : pref;
  }
  function applyTheme(pref) {
    root.setAttribute('data-theme', resolve(pref));
    if (toggle) {
      toggle.setAttribute('data-mode', pref);
      toggle.title = 'Theme: ' + labels[pref];
      toggle.setAttribute('aria-label', 'Colour theme: ' + labels[pref] + '. Click to change.');
    }
  }
  applyTheme(getPref());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = modes[(modes.indexOf(getPref()) + 1) % modes.length];
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  }
  // React to OS change only when in system mode
  mql.addEventListener('change', function () {
    if (getPref() === 'system') applyTheme('system');
  });

  /* ---------- Sticky header shrink ---------- */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 12);
    if (backToTop) backToTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var plain = el.getAttribute('data-plain') === 'true';
    if (prefersReduced || plain) { el.textContent = target + suffix; return; }
    var start = 0, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Scrollspy (active nav link) ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navMap = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    navMap[a.getAttribute('href').slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Object.keys(navMap).forEach(function (id) { navMap[id].classList.remove('active'); });
          var link = navMap[entry.target.id] || navMap[sectionAlias(entry.target.id)];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
  function sectionAlias(id) {
    // sections without their own nav link map to the nearest concept
    if (id === 'home') return 'about';
    if (id === 'booking') return 'services';
    if (id === 'testimonials') return 'compliance';
    return id;
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    var now = new Date();
    if (!isNaN(now.getFullYear())) yearEl.textContent = now.getFullYear();
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('bookingForm');
  if (form) {
    var successEl = form.querySelector('.form-success');
    var submitBtn = form.querySelector('.form-submit');

    function setError(name, msg) {
      var field = form.querySelector('[name="' + name + '"]').closest('.field');
      var errEl = form.querySelector('[data-error-for="' + name + '"]');
      if (msg) {
        field.classList.add('invalid');
        if (errEl) errEl.textContent = msg;
        form.querySelector('[name="' + name + '"]').setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('invalid');
        if (errEl) errEl.textContent = '';
        form.querySelector('[name="' + name + '"]').removeAttribute('aria-invalid');
      }
    }

    function validate() {
      var ok = true, firstBad = null;
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) { setError('name', 'Please enter your name.'); ok = false; firstBad = firstBad || form.name; }
      else setError('name', '');

      if (!email) { setError('email', 'Please enter your email.'); ok = false; firstBad = firstBad || form.email; }
      else if (!emailRe.test(email)) { setError('email', 'Please enter a valid email address.'); ok = false; firstBad = firstBad || form.email; }
      else setError('email', '');

      if (!message) { setError('message', 'Please add a few details about your event.'); ok = false; firstBad = firstBad || form.message; }
      else setError('message', '');

      if (firstBad) firstBad.focus();
      return ok;
    }

    // validate on blur (not keystroke)
    ['name', 'email', 'message'].forEach(function (n) {
      form[n].addEventListener('blur', function () {
        var v = form[n].value.trim();
        if (n === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setError('email', 'Please enter a valid email address.');
        else if (!v) { /* leave until submit */ }
        else setError(n, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (successEl) successEl.textContent = '';
      if (!validate()) return;

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Compose a mailto so the enquiry reaches the team without a backend
      var subject = 'Event medical cover enquiry — ' + (form.name.value.trim());
      var bodyLines = [
        'Name: ' + form.name.value.trim(),
        'Email: ' + form.email.value.trim(),
        'Phone: ' + (form.phone.value.trim() || '—'),
        'Event type: ' + (form.eventType.value.trim() || '—'),
        'Event date(s): ' + (form.eventDate.value.trim() || '—'),
        '',
        'Details:',
        form.message.value.trim()
      ];
      var href = 'mailto:events@belvoircare.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));

      setTimeout(function () {
        window.location.href = href;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        if (successEl) successEl.textContent = 'Thanks! Your email app is opening — just hit send and we’ll be in touch.';
        form.reset();
      }, 600);
    });
  }

  /* ---------- Cookie consent + policy modal ---------- */
  var CONSENT_KEY = 'bc-cookie-consent';
  var banner = document.getElementById('cookieBanner');
  var acceptBtn = document.getElementById('cookieAccept');
  var modal = document.getElementById('cookieModal');
  var modalClose = document.getElementById('cookieModalClose');
  var lastFocused = null;

  function consentStored() {
    try { return !!localStorage.getItem(CONSENT_KEY); } catch (e) { return false; }
  }
  function showBanner() {
    if (banner) banner.hidden = false;
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.add('is-hiding');
    var done = function () { banner.hidden = true; banner.classList.remove('is-hiding'); banner.removeEventListener('transitionend', done); };
    if (prefersReduced) done();
    else { banner.addEventListener('transitionend', done); setTimeout(done, 600); }
  }
  function acceptConsent() {
    try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
    hideBanner();
  }

  if (banner && !consentStored()) showBanner();
  if (acceptBtn) acceptBtn.addEventListener('click', acceptConsent);

  // Modal open/close with focus management
  function getFocusable() {
    if (!modal) return [];
    return Array.prototype.slice.call(
      modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }
  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    // force reflow so the transition runs from the hidden state
    void modal.offsetWidth;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    var done = function () { modal.hidden = true; modal.removeEventListener('transitionend', done); };
    if (prefersReduced) done();
    else { modal.addEventListener('transitionend', done); setTimeout(done, 350); }
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-cookie-open]')).forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(); // click on backdrop
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var f = getFocusable();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Carousels: auto-scroll RTL + drag/swipe (testimonials + events) ---------- */
  (function initCarousels() {
    Array.prototype.forEach.call(document.querySelectorAll('.tcarousel-viewport'), setupCarousel);
  })();

  function setupCarousel(vp) {
    var track = vp.querySelector('.tcarousel-track');
    if (!track) return;
    var wrap = vp.closest('.tcarousel');
    var prevBtn = wrap && wrap.querySelector('.tcarousel-prev');
    var nextBtn = wrap && wrap.querySelector('.tcarousel-next');

    // Triple the cards (two extra copies) and park in the MIDDLE copy, so there is a
    // full set of content on both sides — the strip loops endlessly left AND right.
    var originals = Array.prototype.slice.call(track.children);
    var count = originals.length;
    if (!count) return;
    for (var pass = 0; pass < 2; pass++) {
      originals.forEach(function (node) {
        var clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        Array.prototype.forEach.call(clone.querySelectorAll('a, [tabindex]'), function (el) {
          el.setAttribute('tabindex', '-1');
        });
        track.appendChild(clone);
      });
    }

    // Width of one set (first card of copy 0 -> first card of copy 1).
    function loopWidth() {
      var c1 = track.children[count];
      if (!c1) return 0;
      return c1.offsetLeft - track.children[0].offsetLeft;
    }
    // Keep the scroll position within the middle copy [w, 2w); wrap by exactly one set.
    function normalize() {
      var w = loopWidth();
      if (w <= 0) return;
      if (vp.scrollLeft >= 2 * w) vp.scrollLeft -= w;
      else if (vp.scrollLeft < w) vp.scrollLeft += w;
    }

    // Start parked in the middle copy.
    var startW = loopWidth();
    if (startW > 0) vp.scrollLeft = startW;

    var paused = false;        // hover / focus
    var dragging = false;      // mouse drag in progress
    var userUntil = 0;         // brief yield after wheel/touch/arrow
    var SPEED = 1.0;           // px per frame — continuous drift, right to left (~60px/s)
    var pos = vp.scrollLeft || 0; // float accumulator (scrollLeft is rounded to int on read)

    function autoActive() {
      return !prefersReduced && !paused && !dragging && Date.now() > userUntil;
    }
    function tick() {
      if (autoActive()) {
        var w = loopWidth();
        pos += SPEED;                                 // advance right-to-left (content moves left)
        if (w > 0) { if (pos >= 2 * w) pos -= w; else if (pos < w) pos += w; }
        vp.scrollLeft = pos;
      } else {
        pos = vp.scrollLeft;                          // resync to manual scroll / drag / hover
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Pause while the pointer is over the carousel or focus is inside it; resume on leave.
    if (wrap) {
      wrap.addEventListener('mouseenter', function () { paused = true; });
      wrap.addEventListener('mouseleave', function () { paused = false; });
    }
    vp.addEventListener('focusin', function () { paused = true; });
    vp.addEventListener('focusout', function () { paused = false; });

    // Touch / wheel: let native scrolling drive, just yield the auto-drift briefly.
    vp.addEventListener('wheel', function () { userUntil = Date.now() + 1800; }, { passive: true });
    vp.addEventListener('touchstart', function () { userUntil = Date.now() + 2500; }, { passive: true });
    vp.addEventListener('touchmove', function () { userUntil = Date.now() + 2500; }, { passive: true });
    vp.addEventListener('scroll', normalize, { passive: true });

    // Stop the browser's native image drag-and-drop from hijacking the gesture.
    // Image-heavy carousels (the events strip) can't be mouse-dragged without this.
    vp.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Mouse drag-to-scroll (touch/pen use native momentum scrolling).
    var startX = 0, startLeft = 0;
    vp.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      e.preventDefault(); // suppress native image drag / text selection so the drag scrolls
      dragging = true; startX = e.clientX; startLeft = vp.scrollLeft;
      vp.classList.add('dragging');
      try { vp.setPointerCapture(e.pointerId); } catch (_) {}
    });
    vp.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var w = loopWidth();
      var target = startLeft - (e.clientX - startX);
      // wrap mid-drag so dragging never dead-ends; rebase the anchor by the same amount.
      if (w > 0) {
        if (target >= 2 * w) { target -= w; startLeft -= w; }
        else if (target < w) { target += w; startLeft += w; }
      }
      vp.scrollLeft = target;
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      vp.classList.remove('dragging');
      try { vp.releasePointerCapture(e.pointerId); } catch (_) {}
      userUntil = Date.now() + 1200;
    }
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);

    // Arrow controls: advance by roughly one card.
    function step() {
      var c = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 22;
      return c ? c.getBoundingClientRect().width + gap : 320;
    }
    function nudge(dir) {
      userUntil = Date.now() + 2500;
      vp.scrollBy({ left: dir * step(), behavior: prefersReduced ? 'auto' : 'smooth' });
      setTimeout(normalize, prefersReduced ? 0 : 420);
    }
    // Match the chevron direction: the LEFT (‹) button moves the strip left,
    // the RIGHT (›) button moves it right.
    if (prevBtn) prevBtn.addEventListener('click', function () { nudge(1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { nudge(-1); });
  }
})();
