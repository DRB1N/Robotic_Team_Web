// ── Theme Toggle ──────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Load saved theme
(function () {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();

// ── Scroll animations ─────────────────────────────────────
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-in').forEach((el) => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ── Smooth nav active state ──────────────────────────────
(function () {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
})();
