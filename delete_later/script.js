(function () {
  var body = document.body;
  var swatches = document.querySelectorAll('.swatch');
  var nameEl = document.querySelector('.switcher-name');

  function setName(name) {
    if (nameEl) nameEl.textContent = name;
  }

  function setTheme(theme) {
    body.className = theme;
    swatches.forEach(function (s) {
      var isActive = s.dataset.theme === theme;
      s.classList.toggle('active', isActive);
      if (isActive) setName(s.title);
    });
    try {
      localStorage.setItem('northstar-theme', theme);
    } catch (_) {}
  }

  swatches.forEach(function (s) {
    s.addEventListener('mouseenter', function () {
      setName(this.title);
    });
    s.addEventListener('mouseleave', function () {
      var active = document.querySelector('.swatch.active');
      if (active) setName(active.title);
    });
    s.addEventListener('click', function () {
      setTheme(this.dataset.theme);
    });
  });

  var saved;
  try {
    saved = localStorage.getItem('northstar-theme');
  } catch (_) {}
  if (saved && document.querySelector('.swatch[data-theme="' + saved + '"]')) {
    setTheme(saved);
  } else {
    setTheme('theme-northstar');
  }
})();