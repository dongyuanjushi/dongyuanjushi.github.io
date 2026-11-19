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

  // BibTeX: show/hide and copy.
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.bib-toggle');
    if (toggle) {
      var box = toggle.closest('.pub').querySelector('.bibtex');
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
