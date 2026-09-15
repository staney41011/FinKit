(() => {
  const UX_KEY = 'finkit:ux:v5';
  const MAX_RECENT = 6;
  const MAX_FAVORITES = 8;
  const PANEL_ID = 'finkit-workspace-tools';
  const STYLE_ID = 'finkit-workspace-tools-style';

  const safeParse = (value, fallback) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const readState = () => {
    const saved = safeParse(window.localStorage.getItem(UX_KEY), {});
    return {
      favorites: Array.isArray(saved.favorites) ? saved.favorites.slice(0, MAX_FAVORITES) : [],
      recent: Array.isArray(saved.recent) ? saved.recent.slice(0, MAX_RECENT) : [],
    };
  };

  const writeState = (state) => {
    try {
      window.localStorage.setItem(UX_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage failures (for example private browsing restrictions).
    }
  };

  const normalizeLabel = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const getNav = () => document.querySelector('aside nav');

  const getMenuButtons = () => {
    const nav = getNav();
    if (!nav) return [];
    return Array.from(nav.querySelectorAll('button')).filter((button) => {
      if (button.closest(`#${PANEL_ID}`)) return false;
      return normalizeLabel(button.textContent).length > 0;
    });
  };

  const getActiveLabel = () => {
    const active = getMenuButtons().find((button) =>
      button.classList.contains('bg-sky-50') || button.classList.contains('ring-1'),
    );
    return normalizeLabel(active?.textContent);
  };

  const findButtonByLabel = (label) =>
    getMenuButtons().find((button) => normalizeLabel(button.textContent) === normalizeLabel(label));

  const rememberRecent = (label) => {
    const clean = normalizeLabel(label);
    if (!clean) return;
    const state = readState();
    state.recent = [clean, ...state.recent.filter((item) => item !== clean)].slice(0, MAX_RECENT);
    writeState(state);
    renderShortcuts();
  };

  const navigateTo = (label) => {
    const button = findButtonByLabel(label);
    if (!button) return;
    button.click();
    rememberRecent(label);
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID} { margin-bottom: 1rem; }
      #${PANEL_ID} .finkit-ux-box { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: .75rem; padding: .75rem; }
      #${PANEL_ID} .finkit-ux-title { display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-bottom:.5rem; font-size:.75rem; font-weight:800; color:#475569; }
      #${PANEL_ID} .finkit-search-wrap { position:relative; }
      #${PANEL_ID} .finkit-search { width:100%; height:2.5rem; border:1px solid #cbd5e1; border-radius:.65rem; padding:0 2.2rem 0 .75rem; font-size:.8rem; color:#0f172a; background:#fff; outline:none; }
      #${PANEL_ID} .finkit-search:focus { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,.12); }
      #${PANEL_ID} .finkit-key { position:absolute; right:.55rem; top:50%; transform:translateY(-50%); border:1px solid #e2e8f0; border-radius:.35rem; background:#f8fafc; padding:.05rem .35rem; font-size:.62rem; font-weight:800; color:#94a3b8; }
      #${PANEL_ID} .finkit-row { display:flex; flex-wrap:wrap; gap:.4rem; }
      #${PANEL_ID} .finkit-chip { border:1px solid #e2e8f0; background:#fff; border-radius:999px; padding:.35rem .55rem; font-size:.7rem; font-weight:800; color:#475569; cursor:pointer; }
      #${PANEL_ID} .finkit-chip:hover { border-color:#7dd3fc; color:#0369a1; }
      #${PANEL_ID} .finkit-chip[data-kind="favorite"] { border-color:#fde68a; background:#fffbeb; color:#a16207; }
      #${PANEL_ID} .finkit-actions { display:grid; grid-template-columns:1fr 1fr; gap:.4rem; margin-top:.6rem; }
      #${PANEL_ID} .finkit-action { min-height:2.2rem; border:1px solid #cbd5e1; border-radius:.6rem; background:#fff; padding:.35rem .45rem; font-size:.69rem; font-weight:800; color:#475569; cursor:pointer; }
      #${PANEL_ID} .finkit-action:hover { border-color:#7dd3fc; color:#0369a1; }
      #${PANEL_ID} .finkit-fav-toggle { width:100%; margin-top:.45rem; border:1px solid #bae6fd; border-radius:.6rem; background:#f0f9ff; padding:.45rem .55rem; font-size:.7rem; font-weight:800; color:#0369a1; cursor:pointer; }
      #${PANEL_ID} .finkit-fav-toggle.is-favorite { border-color:#fde68a; background:#fffbeb; color:#a16207; }
      #${PANEL_ID} .finkit-empty { font-size:.68rem; color:#94a3b8; line-height:1.45; }
      #finkit-ux-toast { position:fixed; z-index:9999; right:1rem; bottom:1rem; max-width:22rem; border:1px solid #cbd5e1; border-radius:.75rem; background:#0f172a; color:#fff; padding:.75rem .9rem; box-shadow:0 15px 40px rgba(15,23,42,.2); font-size:.78rem; font-weight:700; opacity:0; transform:translateY(8px); pointer-events:none; transition:.18s ease; }
      #finkit-ux-toast.show { opacity:1; transform:translateY(0); }
      @media print { #${PANEL_ID}, #finkit-ux-toast { display:none !important; } }
    `;
    document.head.appendChild(style);
  };

  let toastTimer;
  const toast = (message) => {
    let node = document.getElementById('finkit-ux-toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'finkit-ux-toast';
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 2400);
  };

  const renderShortcuts = () => {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const favoriteHost = panel.querySelector('[data-finkit-favorites]');
    const recentHost = panel.querySelector('[data-finkit-recent]');
    const toggle = panel.querySelector('[data-finkit-toggle-favorite]');
    const state = readState();

    if (favoriteHost) {
      favoriteHost.innerHTML = state.favorites.length
        ? state.favorites.map((label) => `<button type="button" class="finkit-chip" data-kind="favorite" data-finkit-go="${escapeHtml(label)}">★ ${escapeHtml(label)}</button>`).join('')
        : '<span class="finkit-empty">尚未收藏工具</span>';
    }

    if (recentHost) {
      recentHost.innerHTML = state.recent.length
        ? state.recent.map((label) => `<button type="button" class="finkit-chip" data-finkit-go="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join('')
        : '<span class="finkit-empty">使用工具後會自動出現在這裡</span>';
    }

    if (toggle) {
      const active = getActiveLabel();
      const favorite = active && state.favorites.includes(active);
      toggle.disabled = !active;
      toggle.textContent = !active ? '目前沒有可收藏的工具' : favorite ? `★ 已收藏：${active}` : `☆ 收藏目前：${active}`;
      toggle.classList.toggle('is-favorite', Boolean(favorite));
    }
  };

  const applySearch = (query) => {
    const nav = getNav();
    if (!nav) return;
    const clean = normalizeLabel(query).toLowerCase();
    const buttons = getMenuButtons();

    buttons.forEach((button) => {
      const match = !clean || normalizeLabel(button.textContent).toLowerCase().includes(clean);
      button.style.display = match ? '' : 'none';
    });

    const container = nav.querySelector(':scope > div.space-y-7');
    if (!container) return;
    Array.from(container.children).forEach((group) => {
      if (group.id === PANEL_ID) return;
      const visible = Array.from(group.querySelectorAll('button')).some((button) => button.style.display !== 'none');
      group.style.display = visible ? '' : 'none';
    });
  };

  const exportBackup = () => {
    const entries = {};
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith('finkit:')) entries[key] = window.localStorage.getItem(key);
    }

    const payload = {
      format: 'FinKitBackup',
      version: 1,
      exportedAt: new Date().toISOString(),
      origin: window.location.origin,
      entries,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `finkit-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('FinKit 備份檔已下載。請妥善保存，檔案可能包含你的本機個人資料。');
  };

  const importBackupFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || ''));
        if (payload?.format !== 'FinKitBackup' || payload?.version !== 1 || !payload?.entries || typeof payload.entries !== 'object') {
          throw new Error('Invalid backup format');
        }
        const entries = Object.entries(payload.entries).filter(([key, value]) => key.startsWith('finkit:') && typeof value === 'string');
        if (!entries.length) throw new Error('No FinKit data');

        const approved = window.confirm(`即將還原 ${entries.length} 筆 FinKit 本機資料。相同項目會被備份內容覆蓋，是否繼續？`);
        if (!approved) return;

        entries.forEach(([key, value]) => window.localStorage.setItem(key, value));
        window.alert('還原完成，FinKit 將重新載入以套用資料。');
        window.location.reload();
      } catch {
        window.alert('無法讀取這個備份檔。請確認它是由 FinKit 下載的 JSON 備份。');
      }
    };
    reader.onerror = () => window.alert('讀取備份檔失敗，請重新選擇檔案。');
    reader.readAsText(file, 'utf-8');
  };

  const buildPanel = () => {
    const nav = getNav();
    if (!nav || document.getElementById(PANEL_ID)) return;
    injectStyles();

    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="finkit-ux-box">
        <div class="finkit-ux-title"><span>快速工作台</span><span>v5</span></div>
        <div class="finkit-search-wrap">
          <input class="finkit-search" type="search" inputmode="search" autocomplete="off" placeholder="搜尋工具，例如：房貸、FCN、退休" aria-label="搜尋 FinKit 工具" />
          <span class="finkit-key">Ctrl K</span>
        </div>
        <button type="button" class="finkit-fav-toggle" data-finkit-toggle-favorite>收藏目前工具</button>
        <div style="margin-top:.65rem">
          <div class="finkit-ux-title"><span>我的最愛</span></div>
          <div class="finkit-row" data-finkit-favorites></div>
        </div>
        <div style="margin-top:.65rem">
          <div class="finkit-ux-title"><span>最近使用</span></div>
          <div class="finkit-row" data-finkit-recent></div>
        </div>
        <div class="finkit-actions">
          <button type="button" class="finkit-action" data-finkit-backup>下載備份</button>
          <button type="button" class="finkit-action" data-finkit-restore>還原資料</button>
        </div>
        <input type="file" accept="application/json,.json" data-finkit-file hidden />
      </div>
    `;

    const list = nav.querySelector(':scope > div.space-y-7');
    if (list) list.prepend(panel);
    else nav.prepend(panel);

    const search = panel.querySelector('.finkit-search');
    search?.addEventListener('input', (event) => applySearch(event.target.value));
    search?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const visible = getMenuButtons().find((button) => button.style.display !== 'none');
        if (visible) {
          const label = normalizeLabel(visible.textContent);
          visible.click();
          rememberRecent(label);
          search.value = '';
          applySearch('');
        }
      }
      if (event.key === 'Escape') {
        search.value = '';
        applySearch('');
        search.blur();
      }
    });

    panel.addEventListener('click', (event) => {
      const shortcut = event.target.closest('[data-finkit-go]');
      if (shortcut) {
        navigateTo(shortcut.getAttribute('data-finkit-go'));
        return;
      }

      if (event.target.closest('[data-finkit-toggle-favorite]')) {
        const active = getActiveLabel();
        if (!active) return;
        const state = readState();
        if (state.favorites.includes(active)) {
          state.favorites = state.favorites.filter((item) => item !== active);
          toast(`已取消收藏「${active}」。`);
        } else {
          state.favorites = [active, ...state.favorites.filter((item) => item !== active)].slice(0, MAX_FAVORITES);
          toast(`已收藏「${active}」。`);
        }
        writeState(state);
        renderShortcuts();
        return;
      }

      if (event.target.closest('[data-finkit-backup]')) {
        exportBackup();
        return;
      }

      if (event.target.closest('[data-finkit-restore]')) {
        panel.querySelector('[data-finkit-file]')?.click();
      }
    });

    const fileInput = panel.querySelector('[data-finkit-file]');
    fileInput?.addEventListener('change', (event) => {
      importBackupFile(event.target.files?.[0]);
      event.target.value = '';
    });

    renderShortcuts();
  };

  document.addEventListener('click', (event) => {
    const nav = getNav();
    if (!nav || !nav.contains(event.target)) return;
    const button = event.target.closest('button');
    if (!button || button.closest(`#${PANEL_ID}`)) return;
    const label = normalizeLabel(button.textContent);
    if (!label) return;
    window.setTimeout(() => {
      rememberRecent(label);
      renderShortcuts();
    }, 0);
  }, true);

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      const input = document.querySelector(`#${PANEL_ID} .finkit-search`);
      if (input) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    }
  });

  const observer = new MutationObserver(() => {
    if (!document.getElementById(PANEL_ID)) buildPanel();
    else renderShortcuts();
  });

  const start = () => {
    buildPanel();
    observer.observe(document.body, { childList: true, subtree: true });
    const active = getActiveLabel();
    if (active) rememberRecent(active);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
