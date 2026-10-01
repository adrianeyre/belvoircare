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
      toggle.setAttribute('aria-label', 'Colour theme: ' + labels[pref] + '. Activate to change.');
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
  function menuIsOpen() { return !!navLinks && navLinks.classList.contains('open'); }
  function closeMenu(returnFocus) {
    if (!navLinks) return;
    var wasOpen = menuIsOpen();
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    // Send focus back to the trigger, or it is stranded on a now-hidden link.
    if (wasOpen && returnFocus) menuToggle.focus();
  }
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      // Only claim Escape when the menu is actually open, so it stays available
      // to whatever else is on screen (e.g. an open dialog).
      if (e.key === 'Escape' && menuIsOpen()) closeMenu(true);
    });
  }

  /* ---------- Skip link: move focus as well as the viewport ---------- */
  var skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function () {
      var target = document.getElementById('main');
      if (target) setTimeout(function () { target.focus(); }, 0);
    });
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
      // Only touch the text when it actually changes: re-writing identical
      // content into a role="alert" makes screen readers announce it again.
      if (msg) {
        field.classList.add('invalid');
        if (errEl && errEl.textContent !== msg) errEl.textContent = msg;
        form.querySelector('[name="' + name + '"]').setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('invalid');
        if (errEl && errEl.textContent !== '') errEl.textContent = '';
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

  /* ---------- Cookie consent + accessible dialogs ---------- */
  var CONSENT_KEY = 'bc-cookie-consent';
  var banner = document.getElementById('cookieBanner');
  var acceptBtn = document.getElementById('cookieAccept');

  function consentStored() {
    try { return !!localStorage.getItem(CONSENT_KEY); } catch (e) { return false; }
  }
  // Reserve page space equal to the banner so it never sits entirely on top of
  // a focused control at the bottom of the document (WCAG 2.2 — 2.4.11).
  function reserveBannerSpace() {
    if (!banner || banner.hidden) return;
    var h = banner.getBoundingClientRect().height;
    var gap = parseFloat(getComputedStyle(banner).bottom) || 0;
    root.style.setProperty('--cookie-banner-h', Math.ceil(h + gap * 2) + 'px');
  }
  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    document.body.classList.add('has-cookie-banner');
    reserveBannerSpace();
    window.addEventListener('resize', reserveBannerSpace, { passive: true });
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.add('is-hiding');
    document.body.classList.remove('has-cookie-banner');
    root.style.removeProperty('--cookie-banner-h');
    window.removeEventListener('resize', reserveBannerSpace);
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

  /* Generic modal dialog controller.
     Any number of dialogs: a trigger carries data-modal-open="<overlay id>",
     any close button inside carries data-modal-close. Handles focus move,
     focus trapping, Escape, backdrop click, focus restore, and marks the rest
     of the page inert so assistive tech cannot wander behind the dialog. */
  var openDialog = null;
  var lastFocused = null;
  // Siblings of the dialogs that must be neutralised while one is open.
  var pageRegions = Array.prototype.slice.call(
    document.querySelectorAll('.site-header, main, .site-footer, .back-to-top, .cookie-banner')
  );

  function setPageInert(on) {
    pageRegions.forEach(function (el) {
      if (on) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    });
  }

  function focusableIn(overlay) {
    return Array.prototype.slice.call(
      overlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function openModal(overlay) {
    if (!overlay || openDialog === overlay) return;
    // Switching straight from one dialog to another (e.g. Terms -> Privacy)
    // keeps the original trigger, so closing still returns focus to the page.
    if (openDialog) closeModal(true);
    else lastFocused = document.activeElement;
    openDialog = overlay;
    overlay.hidden = false;
    // force reflow so the transition runs from the hidden state
    void overlay.offsetWidth;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setPageInert(true);
    var closeBtn = overlay.querySelector('[data-modal-close]');
    var first = closeBtn || focusableIn(overlay)[0];
    if (first) first.focus();
  }

  function closeModal(skipFocusRestore) {
    var overlay = openDialog;
    if (!overlay) return;
    openDialog = null;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setPageInert(false);
    var done = function () { overlay.hidden = true; overlay.removeEventListener('transitionend', done); };
    if (prefersReduced) done();
    else { overlay.addEventListener('transitionend', done); setTimeout(done, 350); }
    // Focus has to go back where it came from, or keyboard users are dumped at
    // the top of the document (WCAG 2.4.3 Focus Order).
    if (!skipFocusRestore && lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-modal-open]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(document.getElementById(btn.getAttribute('data-modal-open')));
    });
  });
  Array.prototype.slice.call(document.querySelectorAll('[data-modal-close]')).forEach(function (btn) {
    btn.addEventListener('click', function () { closeModal(); });
  });
  Array.prototype.slice.call(document.querySelectorAll('.modal-overlay')).forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal(); // click on backdrop
    });
  });

  document.addEventListener('keydown', function (e) {
    if (!openDialog) return;
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = focusableIn(openDialog);
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!openDialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }, true);

  /* ---------- 2.4.11 Focus Not Obscured: safety net ----------
     The header is fixed at the top and the cookie banner is fixed at the bottom.
     On short viewports either can end up completely covering whatever has just
     received focus. Scroll the focused element into the clear band between them. */
  (function guardFocusVisibility() {
    var scrolling = false;
    function overlayRects() {
      var rects = [];
      [header, banner, backToTop].forEach(function (el) {
        if (!el || el.hidden) return;
        var cs = getComputedStyle(el);
        if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
        rects.push(el.getBoundingClientRect());
      });
      return rects;
    }
    function coveredBy(rect, o) {
      return o.top <= rect.top && o.bottom >= rect.bottom && o.left <= rect.left && o.right >= rect.right;
    }
    document.addEventListener('focusin', function (e) {
      var el = e.target;
      if (scrolling || !el || typeof el.getBoundingClientRect !== 'function') return;
      if (el === document.body || el.closest('.modal-overlay')) return;
      var overlays = overlayRects();
      if (!overlays.length) return;
      var r = el.getBoundingClientRect();
      if (!r.height) return;
      var hidden = overlays.some(function (o) { return coveredBy(r, o); });
      if (!hidden) return;

      // Work out the band that no fixed overlay occupies, and put the element in it.
      var topGuard = 0, bottomGuard = window.innerHeight;
      overlays.forEach(function (o) {
        if (o.top <= 0) topGuard = Math.max(topGuard, o.bottom);
        if (o.bottom >= window.innerHeight - 1) bottomGuard = Math.min(bottomGuard, o.top);
      });
      var band = bottomGuard - topGuard;
      var targetTop = band > r.height
        ? topGuard + (band - r.height) / 2      // centre it in the clear band
        : topGuard + 8;                          // band is tight: sit just below the header
      scrolling = true;
      window.scrollBy({ top: r.top - targetTop, behavior: prefersReduced ? 'auto' : 'smooth' });
      setTimeout(function () { scrolling = false; }, prefersReduced ? 0 : 400);
    });
  })();

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
        clone.setAttribute('inert', '');
        clone.setAttribute('tabindex', '-1');
        Array.prototype.forEach.call(clone.querySelectorAll('a, button, input, [tabindex]'), function (el) {
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

    var paused = false;        // transient: hover / focus
    var stopped = prefersReduced; // sticky: the user pressed Pause (or asked for reduced motion)
    var dragging = false;      // mouse drag in progress
    var userUntil = 0;         // brief yield after wheel/touch/arrow
    var SPEED = 1.0;           // px per frame — continuous drift, right to left (~60px/s)
    var pos = vp.scrollLeft || 0; // float accumulator (scrollLeft is rounded to int on read)

    function autoActive() {
      return !stopped && !paused && !dragging && Date.now() > userUntil;
    }

    /* Explicit pause/play control — WCAG 2.2.2 requires a mechanism to stop
       motion that starts automatically and runs for more than five seconds.
       Hover/focus pausing is not a mechanism the user can find or operate. */
    var toggleBtn = wrap && wrap.querySelector('[data-carousel-toggle]');
    if (toggleBtn) {
      var toggleLabel = toggleBtn.querySelector('[data-carousel-toggle-label]');
      var labelBase = (toggleLabel ? toggleLabel.textContent : 'auto-scroll').replace(/^Pause\s+/i, '');
      function renderToggle() {
        // aria-pressed=true means "paused" — the button is a Pause that is engaged.
        toggleBtn.setAttribute('aria-pressed', String(stopped));
        if (toggleLabel) toggleLabel.textContent = (stopped ? 'Play ' : 'Pause ') + labelBase;
      }
      toggleBtn.addEventListener('click', function () {
        stopped = !stopped;
        if (!stopped) pos = vp.scrollLeft;
        renderToggle();
      });
      renderToggle();
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

  /* ---------- Equipment explanations (ARIA tabs) ----------
     Each equipment tag is a tab; its explanation is the panel below.
     Pointer users get it on hover, keyboard users on focus/arrow keys,
     touch users on tap, and screen readers via the tab/tabpanel roles.
     One tab is always selected, so the explanation is never empty and the
     content does not obscure anything (WCAG 1.4.13 hover/focus content). */
  var equipTabs = document.querySelector('[data-equip-tabs]');
  if (equipTabs) {
    var tabs = [].slice.call(equipTabs.querySelectorAll('[role="tab"]'));

    function panelFor(tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    }
    function select(tab, moveFocus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = panelFor(t);
        if (panel) panel.hidden = !on;
      });
      if (moveFocus) tab.focus();
    }
    // True while keyboard focus sits on a tag: hovering must not then fight
    // the focused tab for the selection.
    function focusInList() {
      return equipTabs.contains(document.activeElement);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, true); });
      tab.addEventListener('mouseenter', function () {
        if (!focusInList()) select(tab, false);
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });
  }
})();
