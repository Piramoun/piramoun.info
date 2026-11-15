(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  setTheme(root.getAttribute('data-theme') || 'light');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }
  // Follow system changes unless the visitor picked a theme
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onSys = function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) setTheme(e.matches ? 'dark' : 'light');
  };
  if (mq.addEventListener) mq.addEventListener('change', onSys);

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-toggle');
  var links = document.getElementById('nav-links');
  function closeMenu() {
    if (!links) return;
    links.classList.remove('is-open');
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  }
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); } });
  }

  /* ---------- Header border on scroll ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll + active nav link ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if ('IntersectionObserver' in window && links) {
    var navMap = {};
    links.querySelectorAll('a[href^="#"]').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = navMap[en.target.id];
        if (a && en.isIntersecting) {
          links.querySelectorAll('a').forEach(function (x) { x.classList.remove('is-active'); x.removeAttribute('aria-current'); });
          a.classList.add('is-active'); a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navMap).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var say = function (msg, cls) { status.textContent = msg; status.className = 'form-status' + (cls ? ' ' + cls : ''); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
      if (!name || !email || !msg) { say('Fill in your name, email and message.', 'err'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Enter a valid email address.', 'err'); form.email.focus(); return; }
      if (form._gotcha && form._gotcha.value) return;

      // Formspree not set up yet: fall back to the visitor's email app
      if (form.action.indexOf('{{') !== -1 || form.action.indexOf('%7B%7B') !== -1) {
        var body = msg + '\n\n— ' + name + ' (' + email + ')';
        window.location.href = 'mailto:piramoun@gmail.com?subject=' + encodeURIComponent('Website enquiry from ' + name) + '&body=' + encodeURIComponent(body);
        say('Opening your email app…');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; say('Sending…');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (r.ok) { form.reset(); say('Thanks, your message was sent. I\'ll reply soon.', 'ok'); }
          else { say('Your message couldn\'t be sent. Email me at piramoun@gmail.com instead.', 'err'); }
        })
        .catch(function () { say('Your message couldn\'t be sent. Email me at piramoun@gmail.com instead.', 'err'); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
