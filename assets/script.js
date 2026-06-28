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
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) { return 'dark'; }
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
})();
