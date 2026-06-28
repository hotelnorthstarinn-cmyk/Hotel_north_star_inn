(function () {
  var body = document.body;
  var swatches = document.querySelectorAll('.swatch');
  var nameEl = document.querySelector('.switcher-name');
  var categoryEl = document.querySelector('.switcher-category');
  var paletteItems = document.querySelectorAll('.palette-item');
  var copyBtn = document.getElementById('copyBtn');

  var themeCategories = {
    'theme-neutral': 'Timeless Neutrals',
    'theme-serenity': 'Calming Blues & Greens',
    'theme-earthy': 'Earthy & Botanical',
    'theme-pastel': 'Muted Pastels & Pinks',
    'theme-northstar': 'North Star Signature',
    'theme-crimson': 'Crimson Warmth'
  };

  var allVars = [
    '--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary',
    '--accent', '--accent-hover', '--border', '--nav-bg', '--nav-text',
    '--hero-bg', '--hero-text', '--hero-overlay', '--hero-text-crimson',
    '--hero-text-blue', '--footer-bg', '--footer-text', '--shadow-color'
  ];

  function setName(name) {
    if (nameEl) nameEl.textContent = name;
  }

  function setCategory(theme) {
    if (categoryEl) categoryEl.textContent = themeCategories[theme] || '';
  }

  function updatePalette() {
    var style = getComputedStyle(body);
    paletteItems.forEach(function (item) {
      var varName = item.getAttribute('data-var');
      if (!varName) return;
      var val = style.getPropertyValue(varName).trim();
      var hexEl = item.querySelector('.palette-value');
      if (hexEl) hexEl.textContent = val;
    });
  }

  function setTheme(theme) {
    body.className = theme;
    swatches.forEach(function (s) {
      var isActive = s.dataset.theme === theme;
      s.classList.toggle('active', isActive);
      if (isActive) {
        setName(s.title);
        setCategory(s.dataset.theme);
      }
    });
    updatePalette();
    try {
      localStorage.setItem('northstar-theme', theme);
    } catch (_) {}
  }

  function getThemeVars() {
    var style = getComputedStyle(body);
    var result = {};
    allVars.forEach(function (v) {
      result[v] = style.getPropertyValue(v).trim();
    });
    return result;
  }

  function formatThemeCSS() {
    var active = document.querySelector('.swatch.active');
    var name = active ? active.title : 'Theme';
    var vars = getThemeVars();
    var lines = ['/* ' + name + ' */'];
    allVars.forEach(function (k) {
      if (vars[k]) lines.push('  ' + k + ': ' + vars[k] + ';');
    });
    return lines.join('\n');
  }

  function copyThemeCSS() {
    if (!copyBtn) return;
    var css = formatThemeCSS();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(css).then(function () {
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Copied!';
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = 'Copy CSS';
        }, 2000);
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = css;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      body.removeChild(ta);
      copyBtn.classList.add('copied');
      copyBtn.textContent = 'Copied!';
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        copyBtn.textContent = 'Copy CSS';
      }, 2000);
    }
  }

  swatches.forEach(function (s) {
    s.addEventListener('mouseenter', function () {
      setName(this.title);
      setCategory(this.dataset.theme);
    });
    s.addEventListener('mouseleave', function () {
      var active = document.querySelector('.swatch.active');
      if (active) {
        setName(active.title);
        setCategory(active.dataset.theme);
      }
    });
    s.addEventListener('click', function () {
      setTheme(this.dataset.theme);
    });
  });

  document.addEventListener('keydown', function (e) {
    var idx = parseInt(e.key, 10);
    if (idx >= 1 && idx <= 6) {
      e.preventDefault();
      var swatch = swatches[idx - 1];
      if (swatch) setTheme(swatch.dataset.theme);
    }
  });

  if (copyBtn) copyBtn.addEventListener('click', copyThemeCSS);

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
