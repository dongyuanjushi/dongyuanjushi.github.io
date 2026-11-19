(function () {
  var root = document.documentElement;

  // Theme toggle: follows the OS setting until the visitor picks one.
  var btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Counts next to Scholar / GitHub: count up from 0 on load.
  var compact = function (n) { return n < 1000 ? String(n) : (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; };
  var full = function (n) { return Number(n).toLocaleString('en-US'); };
  document.querySelectorAll('.stat .n[data-to]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    var fmt = el.hasAttribute('data-compact') ? compact : full;
    if (!to) return;
    if (reduceMotion) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), dur = 1600;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 2);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });

  // News: scrolls slowly on its own and loops; pauses on hover, focus or touch.
  var ul = document.querySelector('.news .scroller > ul');
  if (ul && !reduceMotion) {
    var items = Array.prototype.slice.call(ul.children);
    if (items.length) {
      items.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
        ul.appendChild(c);
      });
      var SPEED = 18; // pixels per second
      var paused = false, pos = 0, last = performance.now(), resumeTimer;
      var period = function () { return ul.children[items.length].offsetTop - items[0].offsetTop; };
      var pause = function () { paused = true; clearTimeout(resumeTimer); };
      var resume = function (delay) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () { pos = ul.scrollTop; paused = false; }, delay || 0);
      };
      ul.addEventListener('mouseenter', pause);
      ul.addEventListener('mouseleave', function () { resume(0); });
      ul.addEventListener('focusin', pause);
      ul.addEventListener('focusout', function () { resume(0); });
      ul.addEventListener('touchstart', pause, { passive: true });
      ul.addEventListener('touchend', function () { resume(3000); }, { passive: true });
      ul.addEventListener('wheel', function () { pause(); resume(3000); }, { passive: true });
      var tick = function (now) {
        var dt = Math.min(100, now - last); last = now;
        if (!paused && ul.scrollHeight > ul.clientHeight + 4) {
          var P = period();
          pos += SPEED * dt / 1000;
          if (pos >= P) pos -= P;
          ul.scrollTop = pos;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // BibTeX: show/hide and copy.
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.bib-toggle');
    if (toggle) {
      var box = toggle.closest('.pub, .paper').querySelector('.bibtex');
      var open = box.hasAttribute('hidden');
      if (open) box.removeAttribute('hidden'); else box.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
      return;
    }
    var copy = e.target.closest('.bib-copy');
    if (copy) {
      var text = copy.parentNode.querySelector('code').textContent;
      var done = function () { copy.textContent = 'copied'; setTimeout(function () { copy.textContent = 'copy'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { copy.textContent = 'failed'; });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    }
  });
})();
