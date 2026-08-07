// ── Theme Toggle ──────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

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

// ── Nav scroll effect ──────────────────────────────────────
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
})();

// ── Active nav state ───────────────────────────────────────
(function () {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
})();

// ── Section Scanline Effect ─────────────────────────────────
(function () {
  const scanSections = document.querySelectorAll('.section-scanline');
  if (!scanSections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scanned');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  scanSections.forEach(s => obs.observe(s));
})();

// ── Data Stream Effect (Hero) ───────────────────────────────
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const container = document.createElement('div');
  container.className = 'data-stream';
  const chars = '01アイウエオカキクケコ░▒▓█◆◇△▽◁▷';
  for (let i = 0; i < 18; i++) {
    const col = document.createElement('div');
    col.className = 'data-stream-column';
    col.style.left = (5 + Math.random() * 90) + '%';
    col.style.animationDuration = (8 + Math.random() * 12) + 's';
    col.style.animationDelay = (Math.random() * 10) + 's';
    col.style.fontSize = (0.5 + Math.random() * 0.6) + 'rem';
    let text = '';
    const len = 20 + Math.floor(Math.random() * 30);
    for (let j = 0; j < len; j++) text += chars[Math.floor(Math.random() * chars.length)] + ' ';
    col.textContent = text;
    container.appendChild(col);
  }
  hero.appendChild(container);
})();

// ── Floating Particles ──────────────────────────────────────
(function () {
  const body = document.body;
  const container = document.createElement('div');
  container.className = 'particles-container';
  const colors = ['', 'magenta', 'yellow'];
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    const c = colors[Math.floor(Math.random() * colors.length)];
    p.className = 'particle' + (c ? ' ' + c : '');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (10 + Math.random() * 20) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
    container.appendChild(p);
  }
  body.appendChild(container);
})();

// ── Page Transition Effect ─────────────────────────────────
(function () {
  // Add sweep effect on page load
  const sweep = document.createElement('div');
  sweep.className = 'scanline-sweep';
  document.body.appendChild(sweep);
  setTimeout(() => sweep.remove(), 1500);

  // Intercept nav link clicks for transition effect
  document.querySelectorAll('.nav-links a[href]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#' && !href.startsWith('javascript')) {
        e.preventDefault();
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay active';
        document.body.appendChild(overlay);
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      }
    });
  });
})();

// ── Auth Modal ─────────────────────────────────────────────
function showAuthModal(tab) {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  // Trigger reflow for animation
  modal.offsetHeight;
  modal.classList.add('active');
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-error').textContent = '';
  if (tab === 'register') {
    switchAuthTab('register');
  } else {
    switchAuthTab('login');
  }
}

function hideAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function switchAuthTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  const targetTab = document.querySelector(`.modal-tab[data-tab="${tab}"]`);
  if (targetTab) targetTab.classList.add('active');
  document.getElementById('login-form').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? '' : 'none';
  document.getElementById('auth-error').style.display = 'none';
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'fadeInUp 0.3s ease-out';
}

function togglePassword(btn) {
  const input = btn.parentElement.querySelector('input');
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

function setBtnLoading(btn, loading) {
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = '';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('[name="username"]').value.trim();
  const password = form.querySelector('[name="password"]').value;
  if (!username || !password) { showAuthError('请填写用户名和密码'); return; }
  const btn = form.querySelector('button[type="submit"]');
  setBtnLoading(btn, true);
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.error); setBtnLoading(btn, false); return; }
    location.reload();
  } catch (err) {
    showAuthError('网络错误，请重试');
    setBtnLoading(btn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('[name="username"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const password = form.querySelector('[name="password"]').value;
  const confirm = form.querySelector('[name="confirm"]').value;
  if (!username || !email || !password || !confirm) { showAuthError('请填写所有字段'); return; }
  if (password !== confirm) { showAuthError('两次密码不一致'); return; }
  if (password.length < 6) { showAuthError('密码长度至少6位'); return; }
  const btn = form.querySelector('button[type="submit"]');
  setBtnLoading(btn, true);
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.error); setBtnLoading(btn, false); return; }
    const loginRes = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (loginRes.ok) { location.reload(); }
    else { setBtnLoading(btn, false); }
  } catch (err) {
    showAuthError('网络错误，请重试');
    setBtnLoading(btn, false);
  }
}

async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (e) {}
  location.reload();
}

// Close modal on overlay click or Escape key
document.addEventListener('click', function (e) {
  if (e.target.id === 'auth-modal') hideAuthModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') hideAuthModal();
});

// ── Likes ──────────────────────────────────────────────────
let likeCooldown = false;

async function loadLikes() {
  try {
    const res = await fetch('/api/likes');
    const data = await res.json();
    const countEl = document.getElementById('like-count');
    const remainEl = document.getElementById('like-remaining');
    if (countEl) countEl.textContent = data.total;
    if (remainEl && data.remaining !== undefined) {
      remainEl.textContent = '剩余 ' + data.remaining + ' 次';
    }
  } catch (e) {}
}

async function handleLike() {
  if (likeCooldown) return;
  likeCooldown = true;
  const btn = document.getElementById('like-btn');
  try {
    const res = await fetch('/api/like', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      if (btn) {
        btn.classList.add('liked');
        setTimeout(() => btn.classList.remove('liked'), 400);
      }
      const countEl = document.getElementById('like-count');
      if (countEl) countEl.textContent = data.total;
      const remainEl = document.getElementById('like-remaining');
      if (remainEl) {
        remainEl.textContent = data.remaining > 0 ? '剩余 ' + data.remaining + ' 次' : '今日已用完';
        remainEl.style.color = data.remaining > 0 ? 'var(--text-muted)' : 'var(--magenta)';
      }
      // Particle burst effect
      spawnLikeParticles(btn);
    } else if (res.status === 429) {
      if (remainEl) {
        remainEl.textContent = '今日已用完';
        remainEl.style.color = 'var(--magenta)';
      }
    }
  } catch (e) {}
  setTimeout(() => { likeCooldown = false; }, 300);
}

function spawnLikeParticles(btn) {
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const emojis = ['♥', '✦', '★', '♦'];
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    p.className = 'like-particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = (cx + (Math.random() - 0.5) * 60) + 'px';
    p.style.top = (cy + (Math.random() - 0.5) * 20) + 'px';
    p.style.color = Math.random() > 0.5 ? 'var(--magenta)' : 'var(--cyan)';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

// Load likes on page load
if (document.getElementById('like-count')) {
  loadLikes();
}

// ── Guestbook ──────────────────────────────────────────────

function renderMarkdown(text) {
  let html = text;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  return '<p>' + html + '</p>';
}

async function loadGuestbook() {
  const container = document.getElementById('guestbook-list');
  if (!container) return;
  try {
    const res = await fetch('/api/guestbook');
    const entries = await res.json();
    if (entries.length === 0) {
      container.innerHTML = '<p class="gb-empty">还没有留言，来成为第一个留言的人吧。</p>';
      return;
    }
    container.innerHTML = entries.map(e => `
      <div class="gb-card">
        <div class="gb-meta">
          <span class="gb-user">${escapeHtml(e.username)}</span>
          <span class="gb-time">${formatTime(e.created_at)}</span>
        </div>
        <div class="gb-content">${renderMarkdown(e.content)}</div>
        ${e.is_owner ? '<button class="gb-delete" onclick="deleteGuest(' + e.id + ')">删除</button>' : ''}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="gb-empty">加载失败，请刷新重试。</p>';
  }
}

async function submitGuest(e) {
  e.preventDefault();
  const textarea = document.getElementById('guestbook-input');
  const content = textarea.value.trim();
  if (!content) return;
  try {
    const res = await fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const data = await res.json();
      if (res.status === 401) { showAuthModal('login'); return; }
      alert(data.error || '发表失败');
      return;
    }
    textarea.value = '';
    loadGuestbook();
  } catch (err) {
    alert('网络错误，请重试');
  }
}

async function deleteGuest(id) {
  if (!confirm('确定删除这条留言吗？')) return;
  try {
    const res = await fetch('/api/guestbook/' + id, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    loadGuestbook();
  } catch (err) {
    alert('网络错误，请重试');
  }
}

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function formatTime(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

if (document.getElementById('guestbook-list')) {
  loadGuestbook();
}
