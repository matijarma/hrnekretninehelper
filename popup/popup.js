const DEFAULT_STATE = {
  blocked: [],
  tags: {},
  bids: {},
  filters: {
    city: '',
    activity: '',
    street: '',
    minArea: 0,
    maxArea: 0,
    minPrice: 0,
    maxPrice: 0,
    onlyTagged: false,
    onlyBidded: false,
    showBlocked: false
  }
};

const DEFAULT_SETTINGS = {
  language: 'hr',
  theme: 'auto',
  tracking: {
    enabled: true,
    intervalMinutes: 60,
    checkRent: true,
    checkSale: true,
    notifyNew: true,
    notifyStage: true
  }
};

const THEME_ORDER = ['auto', 'light', 'dark'];

let currentSettings = normalizeSettings();
let currentState = normalizeState();
let currentCalls = [];
let currentNotifications = [];
let currentStorageSnapshot = {};
let activeTab = null;
let pageSummary = null;
let filterWriteTimer = null;
let suppressFilterEvents = false;
let storageBytes = 0;
let isSidePanelContext = false;
let activeView = 'main';

function normalizeSettings(raw = {}) {
  const tracking = raw.tracking && typeof raw.tracking === 'object' ? raw.tracking : {};
  return {
    language: ['hr', 'en', 'auto'].includes(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
    theme: ['auto', 'light', 'dark'].includes(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
    tracking: {
      enabled: tracking.enabled !== undefined ? Boolean(tracking.enabled) : DEFAULT_SETTINGS.tracking.enabled,
      intervalMinutes: Math.min(360, Math.max(15, Number.parseInt(tracking.intervalMinutes, 10) || DEFAULT_SETTINGS.tracking.intervalMinutes)),
      checkRent: tracking.checkRent !== undefined ? Boolean(tracking.checkRent) : DEFAULT_SETTINGS.tracking.checkRent,
      checkSale: tracking.checkSale !== undefined ? Boolean(tracking.checkSale) : DEFAULT_SETTINGS.tracking.checkSale,
      notifyNew: tracking.notifyNew !== undefined ? Boolean(tracking.notifyNew) : DEFAULT_SETTINGS.tracking.notifyNew,
      notifyStage: tracking.notifyStage !== undefined ? Boolean(tracking.notifyStage) : DEFAULT_SETTINGS.tracking.notifyStage
    }
  };
}

function normalizeFilters(raw = {}) {
  return {
    city: String(raw.city || ''),
    activity: String(raw.activity || ''),
    street: String(raw.street || ''),
    minArea: Number.parseFloat(raw.minArea) || 0,
    maxArea: Number.parseFloat(raw.maxArea) || 0,
    minPrice: Number.parseFloat(raw.minPrice) || 0,
    maxPrice: Number.parseFloat(raw.maxPrice) || 0,
    onlyTagged: Boolean(raw.onlyTagged),
    onlyBidded: Boolean(raw.onlyBidded),
    showBlocked: Boolean(raw.showBlocked)
  };
}

function normalizeState(raw = {}) {
  return {
    blocked: Array.isArray(raw.blocked) ? [...new Set(raw.blocked.map((id) => String(id).trim()).filter(Boolean))] : [],
    tags: raw.tags && typeof raw.tags === 'object' ? raw.tags : {},
    bids: raw.bids && typeof raw.bids === 'object' ? raw.bids : {},
    filters: normalizeFilters(raw.filters || DEFAULT_STATE.filters)
  };
}

function applyTheme(theme) {
  if (theme === 'auto') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.dataset.theme = dark ? 'dark' : 'light';
    return;
  }
  document.body.dataset.theme = theme;
}

function themeLabel(theme) {
  if (theme === 'light') return 'Svijetla';
  if (theme === 'dark') return 'Tamna';
  return 'Auto';
}

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < (1024 * 1024)) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDateShort(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatNumber(value) {
  if (!value) return '0';
  return new Intl.NumberFormat('hr-HR', { maximumFractionDigits: 2 }).format(value);
}

function formatCurrency(value) {
  if (!value) return '-';
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function showStatus(message, isError = false) {
  const el = document.getElementById('status');
  el.textContent = message;
  el.classList.toggle('error', isError);

  clearTimeout(showStatus._timer);
  showStatus._timer = setTimeout(() => {
    el.textContent = '';
    el.classList.remove('error');
  }, 3600);
}

function getManagedIds(state) {
  const ids = new Set();
  (state.blocked || []).forEach((id) => ids.add(id));
  Object.keys(state.tags || {}).forEach((id) => ids.add(id));
  Object.keys(state.bids || {}).forEach((id) => ids.add(id));
  return ids;
}

function hashTag(tag) {
  let hash = 0;
  const value = String(tag || '');
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createTagPill(tag) {
  const hue = hashTag(tag) % 360;
  const pill = document.createElement('span');
  pill.className = 'tag-pill';
  pill.textContent = tag;
  pill.style.borderColor = `hsla(${hue}, 78%, 42%, 0.55)`;
  pill.style.background = `hsla(${hue}, 84%, 50%, 0.14)`;
  pill.style.color = `hsl(${hue}, 70%, ${document.body.dataset.theme === 'dark' ? 72 : 34}%)`;
  return pill;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function buildCsv(state) {
  const rows = [['PropertyID', 'Blocked', 'Tags', 'BidPriceEUR', 'BidDate', 'BidNote']];
  const ids = Array.from(getManagedIds(state)).sort((a, b) => a.localeCompare(b, 'hr'));

  ids.forEach((id) => {
    const blocked = (state.blocked || []).includes(id) ? 'Da' : 'Ne';
    const tags = (state.tags?.[id] || []).join(' | ');
    const bid = state.bids?.[id] || {};
    rows.push([id, blocked, tags, bid.price || '', bid.date || '', bid.note || '']);
  });

  return `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\n')}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeCategory(call) {
  const source = `${call?.categoryUrl || ''}|${call?.url || ''}`;
  if (source.includes('/zakup-poslovnih-prostora/')) return 'Zakup poslovnih prostora';
  if (source.includes('/prodaja-nekretnina/')) return 'Prodaja nekretnina';
  return '';
}

function isSupportedTargetUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'hr-nekretnine.hr' || parsed.hostname.endsWith('.hr-nekretnine.hr');
  } catch {
    return false;
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0] || null;
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve(response || null);
    });
  });
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response || null);
    });
  });
}

async function detectViewContext() {
  if (!chrome.runtime.getContexts) return;

  try {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['POPUP', 'SIDE_PANEL'],
      documentUrls: [location.href]
    });
    const popupCount = contexts.filter((ctx) => ctx.contextType === 'POPUP').length;
    const sidePanelCount = contexts.filter((ctx) => ctx.contextType === 'SIDE_PANEL').length;
    isSidePanelContext = sidePanelCount > 0 && popupCount === 0;
  } catch {
    isSidePanelContext = false;
  }
}

function setActiveView(view) {
  activeView = view;
  document.querySelectorAll('.view').forEach((node) => {
    node.classList.toggle('is-active', node.id === `view-${view}`);
  });
  document.getElementById('btn-open-main').classList.toggle('is-active', view === 'main');
  const mainTab = document.getElementById('btn-nav-main');
  if (mainTab) mainTab.classList.toggle('is-active', view === 'main');
  document.getElementById('btn-open-settings').classList.toggle('is-active', view === 'settings');
  document.getElementById('btn-open-notifications').classList.toggle('is-active', view === 'notifications');
}

function toggleView(view) {
  setActiveView(activeView === view ? 'main' : view);
}

function fillSettingsForm() {
  document.getElementById('setting-language').value = currentSettings.language;
  document.getElementById('setting-theme').value = currentSettings.theme;

  document.getElementById('tracking-enabled').checked = currentSettings.tracking.enabled;
  document.getElementById('tracking-interval').value = String(currentSettings.tracking.intervalMinutes);
  document.getElementById('tracking-rent').checked = currentSettings.tracking.checkRent;
  document.getElementById('tracking-sale').checked = currentSettings.tracking.checkSale;
  document.getElementById('tracking-notify-new').checked = currentSettings.tracking.notifyNew;
  document.getElementById('tracking-notify-stage').checked = currentSettings.tracking.notifyStage;
  document.getElementById('lbl-theme-cycle').textContent = themeLabel(currentSettings.theme);
}

function renderFilterInputs() {
  suppressFilterEvents = true;
  document.getElementById('filter-city').value = currentState.filters.city;
  document.getElementById('filter-activity').value = currentState.filters.activity;
  document.getElementById('filter-street').value = currentState.filters.street;
  document.getElementById('filter-min-area').value = currentState.filters.minArea || '';
  document.getElementById('filter-max-area').value = currentState.filters.maxArea || '';
  document.getElementById('filter-min-price').value = currentState.filters.minPrice || '';
  document.getElementById('filter-max-price').value = currentState.filters.maxPrice || '';
  document.getElementById('filter-only-tagged').checked = currentState.filters.onlyTagged;
  document.getElementById('filter-only-bidded').checked = currentState.filters.onlyBidded;
  document.getElementById('filter-show-blocked').checked = currentState.filters.showBlocked;
  suppressFilterEvents = false;
}

function readFiltersForm() {
  return normalizeFilters({
    city: document.getElementById('filter-city').value,
    activity: document.getElementById('filter-activity').value,
    street: document.getElementById('filter-street').value,
    minArea: document.getElementById('filter-min-area').value,
    maxArea: document.getElementById('filter-max-area').value,
    minPrice: document.getElementById('filter-min-price').value,
    maxPrice: document.getElementById('filter-max-price').value,
    onlyTagged: document.getElementById('filter-only-tagged').checked,
    onlyBidded: document.getElementById('filter-only-bidded').checked,
    showBlocked: document.getElementById('filter-show-blocked').checked
  });
}

function readTrackingSettingsFromForm() {
  return {
    enabled: document.getElementById('tracking-enabled').checked,
    intervalMinutes: document.getElementById('tracking-interval').value,
    checkRent: document.getElementById('tracking-rent').checked,
    checkSale: document.getElementById('tracking-sale').checked,
    notifyNew: document.getElementById('tracking-notify-new').checked,
    notifyStage: document.getElementById('tracking-notify-stage').checked
  };
}

function renderSelectOptions(selectId, firstLabel, values, selected) {
  const select = document.getElementById(selectId);
  const list = [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'hr'));

  if (selected && !list.includes(selected)) list.unshift(selected);

  const fragment = document.createDocumentFragment();
  fragment.appendChild(new Option(firstLabel, ''));
  list.forEach((value) => fragment.appendChild(new Option(value, value)));
  select.replaceChildren(fragment);
  select.value = selected || '';
}

function renderPageSummary() {
  const pill = document.getElementById('active-page-pill');
  const context = document.getElementById('page-context');
  const hint = document.getElementById('filter-range-hint');

  pill.classList.remove('good', 'warn');

  if (!pageSummary) {
    pill.textContent = 'Nema podataka';
    pill.classList.add('warn');
    context.textContent = 'Otvorite natječajnu stranicu na hr-nekretnine.hr kako biste koristili filtere.';
    hint.textContent = '';
    renderSelectOptions('filter-city', 'Svi gradovi', [], currentState.filters.city);
    renderSelectOptions('filter-activity', 'Sve djelatnosti', [], currentState.filters.activity);
    renderFilterInputs();
    return;
  }

  if (!pageSummary.hasListings) {
    pill.textContent = 'Nema stavki';
    pill.classList.add('warn');
    context.textContent = 'Na aktivnoj stranici trenutno nisu pronađene stavke za filtriranje.';
    hint.textContent = '';
    renderSelectOptions('filter-city', 'Svi gradovi', pageSummary.options?.cities || [], currentState.filters.city);
    renderSelectOptions('filter-activity', 'Sve djelatnosti', pageSummary.options?.activities || [], currentState.filters.activity);
    renderFilterInputs();
    return;
  }

  pill.textContent = 'Aktivna stranica';
  pill.classList.add('good');
  context.textContent = 'Filteri se primjenjuju odmah na otvorenu stranicu.';

  const options = pageSummary.options || {};
  hint.textContent = `Raspon na stranici - površina: ${formatNumber(options.areaMin || 0)} do ${formatNumber(options.areaMax || 0)} m² | početna zakupnina: ${formatNumber(options.priceMin || 0)} do ${formatNumber(options.priceMax || 0)} EUR`;

  document.getElementById('filter-min-area').placeholder = options.areaMin ? String(options.areaMin) : '';
  document.getElementById('filter-max-area').placeholder = options.areaMax ? String(options.areaMax) : '';
  document.getElementById('filter-min-price').placeholder = options.priceMin ? String(options.priceMin) : '';
  document.getElementById('filter-max-price').placeholder = options.priceMax ? String(options.priceMax) : '';

  renderSelectOptions('filter-city', 'Svi gradovi', options.cities || [], currentState.filters.city);
  renderSelectOptions('filter-activity', 'Sve djelatnosti', options.activities || [], currentState.filters.activity);
  renderFilterInputs();
}

function updateMetaPanel(lastCheckedIso, bytes) {
  document.getElementById('meta-last-check').textContent = formatDate(lastCheckedIso);
  document.getElementById('meta-storage').textContent = formatBytes(bytes);

  const activePageText = activeTab?.url
    ? (() => {
        try {
          const parsed = new URL(activeTab.url);
          return `${parsed.hostname}${parsed.pathname}`;
        } catch {
          return 'Nepoznata stranica';
        }
      })()
    : '-';

  document.getElementById('meta-active-page').textContent = activePageText;
}

function renderDashboardStats() {
  const managedIds = getManagedIds(currentState);
  document.getElementById('stat-managed').textContent = String(managedIds.size);
  document.getElementById('stat-bids').textContent = String(Object.keys(currentState.bids || {}).length);
  document.getElementById('stat-hidden').textContent = String((currentState.blocked || []).length);
  document.getElementById('stat-visible').textContent = pageSummary?.stats?.visible !== undefined ? String(pageSummary.stats.visible) : '-';
}

function renderRecentCallsTable() {
  const list = document.getElementById('recent-calls-body');
  list.innerHTML = '';

  const sorted = [...currentCalls]
    .sort((a, b) => new Date(b.lastChangedAt || b.lastSeenAt || 0) - new Date(a.lastChangedAt || a.lastSeenAt || 0))
    .slice(0, 30);

  document.getElementById('recent-empty').hidden = sorted.length > 0;

  sorted.forEach((call) => {
    const item = document.createElement('article');
    item.className = 'item-card';

    const main = document.createElement('div');
    main.className = 'item-main';

    const title = document.createElement('h3');
    title.className = 'item-title';
    title.textContent = call.title || call.id;

    const meta = document.createElement('p');
    meta.className = 'item-meta';
    meta.textContent = normalizeCategory(call) || '-';
    main.append(title, meta);

    const secondary = document.createElement('div');
    secondary.className = 'item-secondary';

    const chips = document.createElement('div');
    chips.className = 'item-chips';
    const badge = document.createElement('span');
    badge.className = `badge ${call.active === false ? 'muted' : 'good'}`;
    badge.textContent = call.stage || (call.active === false ? 'Neaktivno' : 'Aktivno');
    chips.appendChild(badge);

    const deadlineChip = document.createElement('span');
    deadlineChip.className = 'item-chip';
    deadlineChip.textContent = `Rok ${formatDateShort(call.deadline || call.lastSeenAt)}`;
    chips.appendChild(deadlineChip);

    const updatedChip = document.createElement('span');
    updatedChip.className = 'item-chip';
    updatedChip.textContent = `Azurirano ${formatDate(call.lastChangedAt || call.lastSeenAt)}`;
    chips.appendChild(updatedChip);
    secondary.appendChild(chips);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const openBtn = document.createElement('button');
    openBtn.className = 'btn-inline';
    openBtn.type = 'button';
    openBtn.textContent = 'Otvori';
    openBtn.addEventListener('click', () => {
      if (call.url) chrome.tabs.create({ url: call.url });
    });
    actions.appendChild(openBtn);

    item.append(main, secondary, actions);
    list.appendChild(item);
  });
}

function renderNotificationsTable() {
  const list = document.getElementById('notifications-body');
  list.innerHTML = '';

  document.getElementById('notifications-empty').hidden = currentNotifications.length > 0;

  currentNotifications.slice(0, 120).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'item-card';

    const main = document.createElement('div');
    main.className = 'item-main';

    const title = document.createElement('h3');
    title.className = 'item-title';
    title.textContent = item.type === 'new' ? 'Novi natjecaj' : 'Promjena faze';

    const message = document.createElement('p');
    message.className = 'item-meta';
    message.textContent = item.message || '-';
    main.append(title, message);

    const secondary = document.createElement('div');
    secondary.className = 'item-secondary';
    const chips = document.createElement('div');
    chips.className = 'item-chips';

    const time = document.createElement('span');
    time.className = 'item-chip';
    time.textContent = formatDate(item.createdAt);
    chips.appendChild(time);

    const type = document.createElement('span');
    type.className = 'item-chip';
    type.textContent = item.type === 'new' ? 'Novi' : 'Faza';
    chips.appendChild(type);
    secondary.appendChild(chips);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    if (item.url) {
      const openBtn = document.createElement('button');
      openBtn.className = 'btn-inline';
      openBtn.type = 'button';
      openBtn.textContent = 'Otvori';
      openBtn.addEventListener('click', () => chrome.tabs.create({ url: item.url }));
      actions.appendChild(openBtn);
    }

    card.append(main, secondary, actions);
    list.appendChild(card);
  });

  document.getElementById('notification-count').textContent = String(currentNotifications.length);
}

function recordMatchesFilters(record, filters) {
  if (!record) return false;
  if (record.hidden && !filters.showBlocked) return false;
  if (filters.city && record.city !== filters.city) return false;
  if (filters.activity && record.activity !== filters.activity) return false;
  if (filters.street && !String(record.street || '').toLowerCase().includes(filters.street.toLowerCase())) return false;
  if (filters.minArea && Number(record.area || 0) < filters.minArea) return false;
  if (filters.maxArea && Number(record.area || 0) > filters.maxArea) return false;
  if (filters.minPrice && Number(record.price || 0) < filters.minPrice) return false;
  if (filters.maxPrice && Number(record.price || 0) > filters.maxPrice) return false;
  if (filters.onlyTagged && (!Array.isArray(record.tags) || record.tags.length === 0)) return false;
  if (filters.onlyBidded && !record.bidded) return false;
  return true;
}

function createActionCell(actions = []) {
  const cell = document.createElement('td');
  cell.className = 'actions-cell';
  actions.forEach((config) => {
    const btn = document.createElement('button');
    btn.className = 'btn-inline';
    btn.type = 'button';
    btn.textContent = config.label;
    btn.addEventListener('click', config.onClick);
    cell.appendChild(btn);
  });
  return cell;
}

function setStatModalContent(title, headers, rows) {
  document.getElementById('stat-modal-title').textContent = title;

  const head = document.getElementById('stat-modal-head');
  const body = document.getElementById('stat-modal-body');
  head.innerHTML = '';
  body.innerHTML = '';

  const trHead = document.createElement('tr');
  headers.forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    trHead.appendChild(th);
  });
  head.appendChild(trHead);

  rows.forEach((row) => body.appendChild(row));
  document.getElementById('stat-modal-empty').hidden = rows.length > 0;
}

function openStatModal() {
  document.getElementById('stat-modal').hidden = false;
}

function closeStatModal() {
  document.getElementById('stat-modal').hidden = true;
}

async function updateState(mutator) {
  const latest = await chrome.storage.local.get(['nhr_state']);
  const state = normalizeState(latest.nhr_state || currentState);
  mutator(state);
  currentState = state;
  await chrome.storage.local.set({ nhr_state: state });
}

async function showStatDetails(type) {
  const rows = [];

  if (type === 'managed') {
    const ids = Array.from(getManagedIds(currentState)).sort((a, b) => a.localeCompare(b, 'hr'));
    ids.forEach((id) => {
      const row = document.createElement('tr');
      const tags = currentState.tags[id] || [];
      const bid = currentState.bids[id];
      const hidden = currentState.blocked.includes(id);

      const idCell = document.createElement('td');
      idCell.textContent = id;

      const tagsCell = document.createElement('td');
      if (!tags.length) tagsCell.textContent = '-';
      tags.forEach((tag) => tagsCell.appendChild(createTagPill(tag)));

      const bidCell = document.createElement('td');
      bidCell.textContent = bid ? (bid.price ? formatCurrency(bid.price) : 'Označeno') : '-';

      const hiddenCell = document.createElement('td');
      hiddenCell.textContent = hidden ? 'Da' : 'Ne';

      const actions = [];
      if (hidden) {
        actions.push({
          label: 'Prikaži',
          onClick: async () => {
            await updateState((state) => {
              state.blocked = state.blocked.filter((item) => item !== id);
            });
            await loadData();
            await showStatDetails('managed');
          }
        });
      }
      if (bid) {
        actions.push({
          label: 'Makni ponudu',
          onClick: async () => {
            await updateState((state) => {
              delete state.bids[id];
            });
            await loadData();
            await showStatDetails('managed');
          }
        });
      }

      row.append(idCell, tagsCell, bidCell, hiddenCell, createActionCell(actions));
      rows.push(row);
    });

    setStatModalContent('Praćene nekretnine', ['ID', 'Oznake', 'Ponuda', 'Skriveno', 'Akcije'], rows);
  }

  if (type === 'bids') {
    Object.entries(currentState.bids || {}).forEach(([id, bid]) => {
      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      idCell.textContent = id;

      const priceCell = document.createElement('td');
      priceCell.textContent = bid?.price ? formatCurrency(bid.price) : '-';

      const dateCell = document.createElement('td');
      dateCell.textContent = bid?.date || '-';

      const noteCell = document.createElement('td');
      noteCell.textContent = bid?.note || '-';

      const actionCell = createActionCell([{
        label: 'Makni ponudu',
        onClick: async () => {
          await updateState((state) => {
            delete state.bids[id];
          });
          await loadData();
          await showStatDetails('bids');
        }
      }]);

      row.append(idCell, priceCell, dateCell, noteCell, actionCell);
      rows.push(row);
    });

    setStatModalContent('Evidentirane ponude', ['ID', 'Zakupnina', 'Datum', 'Bilješka', 'Akcije'], rows);
  }

  if (type === 'hidden') {
    (currentState.blocked || []).forEach((id) => {
      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      idCell.textContent = id;

      const tagsCell = document.createElement('td');
      const tags = currentState.tags[id] || [];
      if (!tags.length) tagsCell.textContent = '-';
      tags.forEach((tag) => tagsCell.appendChild(createTagPill(tag)));

      const bidCell = document.createElement('td');
      const bid = currentState.bids[id];
      bidCell.textContent = bid ? (bid.price ? formatCurrency(bid.price) : 'Označeno') : '-';

      const actionCell = createActionCell([{
        label: 'Prikaži',
        onClick: async () => {
          await updateState((state) => {
            state.blocked = state.blocked.filter((item) => item !== id);
          });
          await loadData();
          await showStatDetails('hidden');
        }
      }]);

      row.append(idCell, tagsCell, bidCell, actionCell);
      rows.push(row);
    });

    setStatModalContent('Skriveni oglasi', ['ID', 'Oznake', 'Ponuda', 'Akcije'], rows);
  }

  if (type === 'visible') {
    const records = Array.isArray(pageSummary?.records) ? pageSummary.records : [];
    records.filter((record) => recordMatchesFilters(record, currentState.filters)).forEach((record) => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = record.propId;

      const cityCell = document.createElement('td');
      cityCell.textContent = record.city || '-';

      const streetCell = document.createElement('td');
      streetCell.textContent = record.street || '-';

      const activityCell = document.createElement('td');
      activityCell.textContent = record.activity || '-';

      const priceCell = document.createElement('td');
      priceCell.textContent = formatCurrency(record.price || 0);

      const actionCell = createActionCell([{
        label: record.hidden ? 'Prikaži' : 'Sakrij',
        onClick: async () => {
          await updateState((state) => {
            if (record.hidden) {
              state.blocked = state.blocked.filter((item) => item !== record.propId);
            } else if (!state.blocked.includes(record.propId)) {
              state.blocked.push(record.propId);
            }
          });
          await loadData();
          await showStatDetails('visible');
        }
      }]);

      row.append(idCell, cityCell, streetCell, activityCell, priceCell, actionCell);
      rows.push(row);
    });

    setStatModalContent('Vidljivo na stranici', ['ID', 'Grad', 'Adresa', 'Djelatnost', 'Zakupnina', 'Akcije'], rows);
  }

  openStatModal();
}

async function refreshPageSummary({ silent = false } = {}) {
  activeTab = await getActiveTab();
  pageSummary = null;

  if (activeTab?.id && isSupportedTargetUrl(activeTab.url)) {
    const response = await sendTabMessage(activeTab.id, { type: 'nhr-get-page-summary' });
    if (response?.ok) pageSummary = response;
  }

  renderPageSummary();
  renderDashboardStats();
  updateMetaPanel(currentStorageSnapshot.tenders_last_checked_at, storageBytes);
  if (!silent) showStatus('Podaci stranice su osvježeni.');
}

async function persistFilters(filters, { silent = true } = {}) {
  const latest = await chrome.storage.local.get(['nhr_state']);
  const mergedState = normalizeState(latest.nhr_state || currentState);
  mergedState.filters = normalizeFilters(filters);
  currentState = mergedState;
  await chrome.storage.local.set({ nhr_state: mergedState });
  if (!silent) showStatus('Filteri su spremljeni.');
}

function queueFilterSave() {
  if (suppressFilterEvents) return;
  clearTimeout(filterWriteTimer);
  filterWriteTimer = setTimeout(async () => {
    await persistFilters(readFiltersForm(), { silent: true });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await refreshPageSummary({ silent: true });
  }, 180);
}

async function saveInterfaceSettings() {
  currentSettings = normalizeSettings({
    ...currentSettings,
    language: document.getElementById('setting-language').value,
    theme: document.getElementById('setting-theme').value
  });

  applyTheme(currentSettings.theme);
  document.getElementById('lbl-theme-cycle').textContent = themeLabel(currentSettings.theme);

  const latest = await chrome.storage.local.get(['nhr_settings']);
  const merged = normalizeSettings(latest.nhr_settings || currentSettings);
  merged.language = currentSettings.language;
  merged.theme = currentSettings.theme;
  currentSettings = merged;

  await chrome.storage.local.set({ nhr_settings: currentSettings });
  showStatus('Postavke su spremljene.');
}

async function saveTrackingSettings() {
  currentSettings = normalizeSettings({ ...currentSettings, tracking: readTrackingSettingsFromForm() });
  await chrome.storage.local.set({ nhr_settings: currentSettings });
  showStatus('Postavke su spremljene.');
}

async function runManualCheck() {
  try {
    await sendRuntimeMessage({ type: 'nhr-run-check-now' });
    showStatus('Pokrenuta je ručna provjera natječaja.');
  } catch (error) {
    showStatus(String(error?.message || error), true);
  }
}

async function openNativeSidePanel() {
  if (!chrome.sidePanel) {
    showStatus('Bočni panel nije dostupan u ovoj verziji preglednika.', true);
    return;
  }

  try {
    await sendRuntimeMessage({ type: 'nhr-open-sidepanel', tabId: activeTab?.id || null });
    showStatus('Bočni panel je otvoren.');
    if (!isSidePanelContext) window.close();
  } catch {
    showStatus('Bočni panel nije dostupan u ovoj verziji preglednika.', true);
  }
}

async function cycleThemeMode() {
  const index = THEME_ORDER.indexOf(currentSettings.theme);
  const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
  currentSettings = normalizeSettings({ ...currentSettings, theme: next });
  applyTheme(next);
  document.getElementById('setting-theme').value = next;
  document.getElementById('lbl-theme-cycle').textContent = themeLabel(next);
  await chrome.storage.local.set({ nhr_settings: currentSettings });
  showStatus('Tema je ažurirana.');
}

async function clearNotifications() {
  await chrome.storage.local.set({ nhr_notifications: [] });
  currentNotifications = [];
  renderNotificationsTable();
  showStatus('Obavijesti su očišćene.');
}

async function loadData() {
  const storage = await chrome.storage.local.get([
    'nhr_state',
    'nhr_settings',
    'tenders_cache',
    'tenders_last_checked_at',
    'nhr_notifications'
  ]);

  currentState = normalizeState(storage.nhr_state || DEFAULT_STATE);
  currentSettings = normalizeSettings(storage.nhr_settings || DEFAULT_SETTINGS);
  currentCalls = Object.values(storage.tenders_cache || {});
  currentNotifications = Array.isArray(storage.nhr_notifications) ? storage.nhr_notifications : [];
  currentStorageSnapshot = storage;

  applyTheme(currentSettings.theme);
  document.getElementById('btn-open-sidepanel').style.display = chrome.sidePanel && !isSidePanelContext ? 'inline-flex' : 'none';
  fillSettingsForm();
  renderFilterInputs();
  storageBytes = await chrome.storage.local.getBytesInUse();

  await refreshPageSummary({ silent: true });
  renderDashboardStats();
  renderRecentCallsTable();
  renderNotificationsTable();
  updateMetaPanel(storage.tenders_last_checked_at, storageBytes);
}

function bindActions() {
  document.getElementById('btn-open-main').addEventListener('click', () => setActiveView('main'));
  const mainTab = document.getElementById('btn-nav-main');
  if (mainTab) mainTab.addEventListener('click', () => setActiveView('main'));
  document.getElementById('btn-open-settings').addEventListener('click', () => toggleView('settings'));
  document.getElementById('btn-open-notifications').addEventListener('click', () => toggleView('notifications'));
  document.getElementById('btn-open-sidepanel').addEventListener('click', openNativeSidePanel);
  document.getElementById('btn-theme-cycle').addEventListener('click', cycleThemeMode);

  document.getElementById('btn-save-interface').addEventListener('click', saveInterfaceSettings);
  document.getElementById('btn-save-settings').addEventListener('click', saveTrackingSettings);
  document.getElementById('btn-run-check').addEventListener('click', runManualCheck);
  document.getElementById('btn-clear-notifications').addEventListener('click', clearNotifications);

  document.getElementById('btn-reset-filters').addEventListener('click', async () => {
    currentState.filters = normalizeFilters(DEFAULT_STATE.filters);
    renderFilterInputs();
    await persistFilters(currentState.filters, { silent: false });
    await refreshPageSummary({ silent: true });
  });

  document.getElementById('btn-refresh-page').addEventListener('click', async () => {
    await refreshPageSummary();
    storageBytes = await chrome.storage.local.getBytesInUse();
    updateMetaPanel(currentStorageSnapshot.tenders_last_checked_at, storageBytes);
  });

  ['filter-city', 'filter-activity', 'filter-only-tagged', 'filter-only-bidded', 'filter-show-blocked'].forEach((id) => {
    document.getElementById(id).addEventListener('change', queueFilterSave);
  });

  ['filter-street', 'filter-min-area', 'filter-max-area', 'filter-min-price', 'filter-max-price'].forEach((id) => {
    document.getElementById(id).addEventListener('input', queueFilterSave);
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const payload = JSON.stringify({
      nhr_state: currentState,
      nhr_settings: currentSettings,
      tenders_cache: currentStorageSnapshot.tenders_cache || {},
      tenders_last_checked_at: currentStorageSnapshot.tenders_last_checked_at || null,
      nhr_notifications: currentNotifications,
      exported_at: new Date().toISOString()
    }, null, 2);
    downloadBlob(new Blob([payload], { type: 'application/json' }), `nhr_backup_${new Date().toISOString().slice(0, 10)}.json`);
    showStatus('JSON izvoz je spreman.');
  });

  document.getElementById('btn-export-csv').addEventListener('click', () => {
    const csv = buildCsv(currentState);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `nhr_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    showStatus('CSV izvoz je spreman.');
  });

  document.getElementById('import-file').addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (parsed && typeof parsed === 'object' && parsed.nhr_state) {
          await chrome.storage.local.set({
            nhr_state: normalizeState(parsed.nhr_state || DEFAULT_STATE),
            nhr_settings: normalizeSettings(parsed.nhr_settings || DEFAULT_SETTINGS),
            tenders_cache: parsed.tenders_cache || {},
            tenders_last_checked_at: parsed.tenders_last_checked_at || null,
            nhr_notifications: Array.isArray(parsed.nhr_notifications) ? parsed.nhr_notifications : []
          });
        } else {
          await chrome.storage.local.set({ nhr_state: normalizeState(parsed) });
        }
        await loadData();
        showStatus('Uvoz je uspješan.');
      } catch {
        showStatus('Neispravna JSON datoteka.', true);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-clear').addEventListener('click', async () => {
    if (!confirm('Obrisati sve lokalne podatke ekstenzije?')) return;
    await chrome.storage.local.remove([
      'nhr_state', 'nhr_settings', 'tenders_cache', 'tenders_last_checked_at', 'tenders_last_result', 'nhr_notifications'
    ]);
    currentState = normalizeState(DEFAULT_STATE);
    await loadData();
    showStatus('Podaci su obrisani.');
  });

  document.querySelectorAll('.stat-card').forEach((node) => {
    const statType = node.dataset.stat;
    node.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('button')) return;
      showStatDetails(statType);
    });
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showStatDetails(statType);
      }
    });
  });

  document.querySelectorAll('[data-stat-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const statType = button.dataset.statAction;
      showStatDetails(statType);
    });
  });

  document.getElementById('btn-close-stat-modal').addEventListener('click', closeStatModal);
  document.getElementById('stat-modal').addEventListener('click', (event) => {
    if (event.target.id === 'stat-modal') closeStatModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeStatModal();
  });

  chrome.tabs.onActivated.addListener(async () => {
    await refreshPageSummary({ silent: true });
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status !== 'complete') return;
    const focusedTab = await getActiveTab();
    if (!focusedTab?.id || focusedTab.id !== tabId) return;
    await refreshPageSummary({ silent: true });
  });

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return;
    if (changes.nhr_state || changes.nhr_settings || changes.tenders_cache || changes.tenders_last_checked_at || changes.nhr_notifications) {
      await loadData();
    }
  });
}

(async function init() {
  closeStatModal();
  await detectViewContext();
  await loadData();
  bindActions();
  setActiveView('main');
})();
