(function() {
  const STORAGE_KEY = 'portfolio-theme';

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('theme-dark');
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isDark ? '#121214' : '#dfd1bc');
    }

    if (typeof window.__set3DTheme === 'function') {
      window.__set3DTheme(isDark);
    }

    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme, isDark } }));
  }

  window.togglePortfolioTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (e) {}
    applyTheme(nextTheme);
  };

  // Immediate execution to prevent flash
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // SVG Icons
  const SUN_SVG = `<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const MOON_SVG = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'theme-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', initialTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', initialTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('data-sound', 'click');
    btn.setAttribute('data-hoversound', 'hover');
    btn.setAttribute('data-cursor', 'circle-white');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'theme-toggle-icon';
    iconSpan.innerHTML = SUN_SVG + MOON_SVG;
    btn.appendChild(iconSpan);

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.togglePortfolioTheme();
    });

    return btn;
  }

  function mountThemeButton() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return false;

    let existingBtn = document.getElementById('theme-toggle-btn');
    if (!existingBtn) {
      const btn = createToggleButton();
      // Insert after or before sounds toggle
      const soundsToggle = headerRight.querySelector('.music-toggle, .header-sounds-toggle');
      if (soundsToggle && soundsToggle.parentNode === headerRight) {
        headerRight.insertBefore(btn, soundsToggle);
      } else {
        headerRight.appendChild(btn);
      }
      return true;
    } else if (existingBtn.parentNode !== headerRight) {
      headerRight.appendChild(existingBtn);
      return true;
    }
    return true;
  }

  // Auto-mount and observe DOM changes
  function setupAutoMount() {
    if (!mountThemeButton()) {
      const observer = new MutationObserver(function() {
        if (mountThemeButton()) {
          // Keep observing in case header rerenders
        }
      });
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    }

    // Secondary interval for guarantee
    const interval = setInterval(function() {
      if (document.querySelector('.header-right')) {
        mountThemeButton();
      }
    }, 400);

    // Stop polling after 15 seconds, MutationObserver remains
    setTimeout(() => clearInterval(interval), 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoMount);
  } else {
    setupAutoMount();
  }

  // System theme change listener
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    });
  }
})();
