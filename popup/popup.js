/* ═══════════════════════════════════════════════════════════
   DN Nekretnine Helper — Popup Controller
   ═══════════════════════════════════════════════════════════
   v1.5 — All bugs fixed:
   - Proper natječaj date display
   - sourceUrl-based property links
   - Full i18n system
   - Auto-save settings (no save buttons)
   - Range sliders for površina/zakupnina
   - Theme/lang as toggles
   ═══════════════════════════════════════════════════════════ */

/* ── i18n Translation Map ──────────────────────────────── */

const POPUP_I18N = {
  hr: {
    'popup-title': 'DN Nekretnine Helper',
    'popup-subtitle': 'Privatni CRM za državne nekretnine',
    tabHome: 'Pregled i filteri',
    tabFeed: 'Natječaji',
    tabSettings: 'Postavke',
    lblStatus: 'Status',
    noData: 'Nema podataka',
    noItems: 'Nema stavki',
    connected: 'Povezano',
    pageContextHint: 'Otvorite natječajnu stranicu na hr-nekretnine.hr kako biste koristili filtere.',
    pageContextNoItems: 'Na aktivnoj stranici trenutno nisu pronađene stavke za filtriranje.',
    pageContextActive: 'Filteri se primjenjuju odmah na otvorenu stranicu.',
    lblManaged: 'Praćene nekretnine',
    lblBids: 'Evidentirane ponude',
    lblHidden: 'Skriveni oglasi',
    lblVisible: 'Vidljivo na stranici',
    lblFilters: 'Filteri',
    btnReset: 'Reset',
    lblCity: 'Grad',
    allCities: 'Svi gradovi',
    lblActivity: 'Predložena djelatnost',
    allActivities: 'Sve djelatnosti',
    lblStreet: 'Ulica / adresa',
    streetPlaceholder: 'Npr. Draškovićeva',
    lblArea: 'Površina (m²)',
    lblPrice: 'Zakupnina (EUR)',
    lblOnlyTagged: 'Samo označene',
    lblOnlyBidded: 'Samo s ponudom',
    lblShowHidden: 'Prikaži skrivene',
    lblTracking: 'Praćenje natječaja',
    lblTrackingEnabled: 'Uključeno praćenje',
    lblRent: 'Zakup poslovnih prostora',
    lblSale: 'Prodaja nekretnina',
    lblNotifyNew: 'Notifikacija za novi natječaj',
    lblNotifyStage: 'Notifikacija za promjenu faze',
    lblData: 'Podaci',
    btnExportJson: 'Izvoz JSON',
    btnExportCsv: 'Izvoz CSV',
    btnImportJson: 'Uvoz JSON',
    btnClearAll: 'Obriši sve',
    lblStorage: 'Pohrana',
    lblLastCheck: 'Zadnja provjera',
    lblActivePage: 'Aktivna stranica',
    noActivity: 'Nema aktivnosti.',
    btnClear: 'Očisti',
    feedNewTender: 'Novi natječaj',
    feedStageChange: 'Promjena faze',
    feedOpen: 'Otvori',
    feedDeadline: 'Rok',
    feedFilterAll: 'Sve',
    feedFilterRent: 'Zakup',
    feedFilterSale: 'Prodaja',
    confirmDeleteTitle: 'Potvrda brisanja',
    confirmDeleteMsg: 'Obrisati sve lokalne podatke ekstenzije?',
    confirmDeleteBtn: 'Obriši sve',
    confirmCancel: 'Odustani',
    confirmOk: 'Potvrdi',
    toastDataRefreshed: 'Podaci stranice su osvježeni.',
    toastSettingsSaved: 'Postavke su spremljene.',
    toastNotificationsCleared: 'Obavijesti su očišćene.',
    toastExportJson: 'JSON izvoz je spreman.',
    toastExportCsv: 'CSV izvoz je spreman.',
    toastImportOk: 'Uvoz je uspješan.',
    toastImportErr: 'Neispravna JSON datoteka.',
    toastDataCleared: 'Podaci su obrisani.',
    toastFiltersReset: 'Filteri su resetirani.',
    themeAuto: 'Auto',
    themeLight: 'Svijetla',
    themeDark: 'Tamna',
    modalManaged: 'Praćene nekretnine',
    modalBids: 'Evidentirane ponude',
    modalHidden: 'Skriveni oglasi',
    modalVisible: 'Vidljivo na stranici',
    thId: 'ID', thTags: 'Oznake', thBid: 'Ponuda', thHidden: 'Skriveno', thActions: 'Akcije',
    thRent: 'Zakupnina', thDate: 'Datum', thNote: 'Bilješka',
    thCity: 'Grad', thAddress: 'Adresa', thActivity: 'Djelatnost',
    actionShow: 'Prikaži', actionRemoveBid: 'Makni ponudu', actionHide: 'Sakrij',
    marked: 'Označeno', yes: 'Da', no: 'Ne'
  },
  en: {
    'popup-title': 'DN Nekretnine Helper',
    'popup-subtitle': 'Private CRM for state properties',
    tabHome: 'Overview & Filters',
    tabFeed: 'Tenders',
    tabSettings: 'Settings',
    lblStatus: 'Status',
    noData: 'No data',
    noItems: 'No items',
    connected: 'Connected',
    pageContextHint: 'Open a tender page on hr-nekretnine.hr to use filters.',
    pageContextNoItems: 'No filterable items found on the active page.',
    pageContextActive: 'Filters are applied instantly to the open page.',
    lblManaged: 'Tracked properties',
    lblBids: 'Recorded bids',
    lblHidden: 'Hidden listings',
    lblVisible: 'Visible on page',
    lblFilters: 'Filters',
    btnReset: 'Reset',
    lblCity: 'City',
    allCities: 'All cities',
    lblActivity: 'Proposed activity',
    allActivities: 'All activities',
    lblStreet: 'Street / address',
    streetPlaceholder: 'e.g. Draškovićeva',
    lblArea: 'Area (m²)',
    lblPrice: 'Rent (EUR)',
    lblOnlyTagged: 'Tagged only',
    lblOnlyBidded: 'With bid only',
    lblShowHidden: 'Show hidden',
    lblTracking: 'Tender tracking',
    lblTrackingEnabled: 'Tracking enabled',
    lblRent: 'Business space rental',
    lblSale: 'Property sale',
    lblNotifyNew: 'Notify on new tender',
    lblNotifyStage: 'Notify on stage change',
    lblData: 'Data',
    btnExportJson: 'Export JSON',
    btnExportCsv: 'Export CSV',
    btnImportJson: 'Import JSON',
    btnClearAll: 'Clear all',
    lblStorage: 'Storage',
    lblLastCheck: 'Last check',
    lblActivePage: 'Active page',
    noActivity: 'No activity.',
    btnClear: 'Clear',
    feedNewTender: 'New tender',
    feedStageChange: 'Stage change',
    feedOpen: 'Open',
    feedDeadline: 'Deadline',
    feedFilterAll: 'All',
    feedFilterRent: 'Rent',
    feedFilterSale: 'Sale',
    confirmDeleteTitle: 'Confirm deletion',
    confirmDeleteMsg: 'Delete all local extension data?',
    confirmDeleteBtn: 'Delete all',
    confirmCancel: 'Cancel',
    confirmOk: 'Confirm',
    toastDataRefreshed: 'Page data refreshed.',
    toastSettingsSaved: 'Settings saved.',
    toastNotificationsCleared: 'Notifications cleared.',
    toastExportJson: 'JSON export ready.',
    toastExportCsv: 'CSV export ready.',
    toastImportOk: 'Import successful.',
    toastImportErr: 'Invalid JSON file.',
    toastDataCleared: 'Data cleared.',
    toastFiltersReset: 'Filters reset.',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    modalManaged: 'Tracked properties',
    modalBids: 'Recorded bids',
    modalHidden: 'Hidden listings',
    modalVisible: 'Visible on page',
    thId: 'ID', thTags: 'Tags', thBid: 'Bid', thHidden: 'Hidden', thActions: 'Actions',
    thRent: 'Rent', thDate: 'Date', thNote: 'Note',
    thCity: 'City', thAddress: 'Address', thActivity: 'Activity',
    actionShow: 'Show', actionRemoveBid: 'Remove bid', actionHide: 'Hide',
    marked: 'Marked', yes: 'Yes', no: 'No'
  }
};

/* ── Defaults ──────────────────────────────────────────── */

const DEFAULT_STATE = {
  blocked: [],
  tags: {},
  bids: {},
  sourceUrls: {},
  filters: {
    city: [],
    activity: [],
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
  feedCategory: 'all',
  tracking: {
    enabled: true,
    checkRent: true,
    checkSale: true,
    notifyNew: true,
    notifyStage: true
  }
};

const THEME_ORDER = ['auto', 'light', 'dark'];
const THEME_ICONS = { auto: 'fa-adjust', light: 'fa-sun', dark: 'fa-moon' };

let currentSettings = normalizeSettings();
let currentState = normalizeState();
let currentCalls = [];
let currentNotifications = [];
let currentStorageSnapshot = {};
let activeTab = null;
let pageSummary = null;
let filterWriteTimer = null;
let suppressFilterEvents = false;
let dropdownState = { city: [], activity: [] };
let storageBytes = 0;
let isSidePanelContext = false;
let activeView = 'home';
let currentLang = 'hr';

/* ── i18n ───────────────────────────────────────────────── */

function t(key) {
  return POPUP_I18N[currentLang]?.[key] || POPUP_I18N.hr[key] || key;
}

function resolveLanguage(setting) {
  if (setting === 'hr' || setting === 'en') return setting;
  const uiLang = (navigator.language || 'hr').toLowerCase();
  return uiLang.startsWith('hr') ? 'hr' : 'en';
}

function applyLanguage() {
  currentLang = resolveLanguage(currentSettings.language);

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && POPUP_I18N[currentLang]?.[key]) {
      el.textContent = POPUP_I18N[currentLang][key];
    }
  });

  // Update placeholders
  const streetInput = document.getElementById('filter-street');
  if (streetInput) streetInput.placeholder = t('streetPlaceholder');

  // Update lang toggle button text
  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) {
    langBtn.querySelector('.lang-toggle-label').textContent = currentLang.toUpperCase();
  }

  // Update popup title/subtitle
  document.getElementById('popup-title').textContent = t('popup-title');
  document.getElementById('popup-subtitle').textContent = t('popup-subtitle');
}

/* ── Normalize helpers ──────────────────────────────────── */

function normalizeSettings(raw = {}) {
  const tracking = raw.tracking && typeof raw.tracking === 'object' ? raw.tracking : {};
  return {
    language: ['hr', 'en', 'auto'].includes(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
    theme: ['auto', 'light', 'dark'].includes(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
    feedCategory: ['all', 'rent', 'sale'].includes(raw.feedCategory) ? raw.feedCategory : DEFAULT_SETTINGS.feedCategory,
    tracking: {
      enabled: tracking.enabled !== undefined ? Boolean(tracking.enabled) : DEFAULT_SETTINGS.tracking.enabled,
      checkRent: tracking.checkRent !== undefined ? Boolean(tracking.checkRent) : DEFAULT_SETTINGS.tracking.checkRent,
      checkSale: tracking.checkSale !== undefined ? Boolean(tracking.checkSale) : DEFAULT_SETTINGS.tracking.checkSale,
      notifyNew: tracking.notifyNew !== undefined ? Boolean(tracking.notifyNew) : DEFAULT_SETTINGS.tracking.notifyNew,
      notifyStage: tracking.notifyStage !== undefined ? Boolean(tracking.notifyStage) : DEFAULT_SETTINGS.tracking.notifyStage
    }
  };
}

function normalizeFilters(raw = {}) {
  return {
    city: Array.isArray(raw.city) ? raw.city : (raw.city ? [String(raw.city)] : []),
    activity: Array.isArray(raw.activity) ? raw.activity : (raw.activity ? [String(raw.activity)] : []),
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
    sourceUrls: raw.sourceUrls && typeof raw.sourceUrls === 'object' ? raw.sourceUrls : {},
    filters: normalizeFilters(raw.filters || DEFAULT_STATE.filters)
  };
}

/* ── Theme ──────────────────────────────────────────────── */

function applyTheme(theme) {
  if (theme === 'auto') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.dataset.theme = dark ? 'dark' : 'light';
    return;
  }
  document.body.dataset.theme = theme;
}

function themeLabel(theme) {
  return t(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
}

function updateThemeIcon() {
  const icon = document.querySelector('#btn-theme-cycle i');
  if (!icon) return;
  icon.className = `fas ${THEME_ICONS[currentSettings.theme] || THEME_ICONS.auto}`;
}

/* ── Formatting helpers ─────────────────────────────────── */

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

function timeAgo(iso) {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return currentLang === 'en' ? 'just now' : 'upravo sada';
  if (mins < 60) return currentLang === 'en' ? `${mins}m ago` : `prije ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return currentLang === 'en' ? `${hours}h ago` : `prije ${hours}h`;
  const days = Math.floor(hours / 24);
  return currentLang === 'en' ? `${days}d ago` : `prije ${days}d`;
}

function getValidTimestamp(value) {
  const ts = Date.parse(String(value || ''));
  return Number.isFinite(ts) ? ts : 0;
}

function getCallSortTimestamp(call) {
  return (
    getValidTimestamp(call?.publicationDate) ||
    getValidTimestamp(call?.firstSeenAt) ||
    getValidTimestamp(call?.lastSeenAt)
  );
}

/* ── Status toast ───────────────────────────────────────── */

function showStatus(message, isError = false) {
  const el = document.getElementById('status');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.add('visible');

  clearTimeout(showStatus._timer);
  showStatus._timer = setTimeout(() => {
    el.classList.remove('visible');
  }, 2800);
}

/* ── State helpers ──────────────────────────────────────── */

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

/* ── CSV / Export helpers ───────────────────────────────── */

function escapeCsv(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function buildCsv(state) {
  const rows = [['PropertyID', 'Blocked', 'Tags', 'BidPriceEUR', 'BidDate', 'BidNote', 'SourceURL']];
  const ids = Array.from(getManagedIds(state)).sort((a, b) => a.localeCompare(b, 'hr'));

  ids.forEach((id) => {
    const blocked = (state.blocked || []).includes(id) ? 'Da' : 'Ne';
    const tags = (state.tags?.[id] || []).join(' | ');
    const bid = state.bids?.[id] || {};
    const sourceUrl = state.sourceUrls?.[id] || '';
    rows.push([id, blocked, tags, bid.price || '', bid.date || '', bid.note || '', sourceUrl]);
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

/* ── Category helpers ───────────────────────────────────── */

function normalizeCategory(call) {
  const source = `${call?.categoryUrl || ''}|${call?.url || ''}`;
  if (source.includes('/zakup-poslovnih-prostora/')) return currentLang === 'en' ? 'Business space rental' : 'Zakup poslovnih prostora';
  if (source.includes('/prodaja-nekretnina/')) return currentLang === 'en' ? 'Property sale' : 'Prodaja nekretnina';
  return '';
}

function getCallCategory(call) {
  const source = `${call?.categoryUrl || ''}|${call?.url || ''}`;
  if (source.includes('/zakup-poslovnih-prostora/')) return 'rent';
  if (source.includes('/prodaja-nekretnina/')) return 'sale';
  return 'other';
}

function renderFeedCategoryButtons() {
  const active = currentSettings.feedCategory || 'all';
  document.querySelectorAll('.feed-filter-btn[data-feed-category]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.feedCategory === active);
  });
}

/* ── Tab / URL helpers ──────────────────────────────────── */

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
      if (chrome.runtime.lastError) { resolve(null); return; }
      resolve(response || null);
    });
  });
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
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

/* ── Resolve property URL ───────────────────────────────── */

function resolvePropertyUrl(propId) {
  // 1. Check stored sourceUrl
  if (currentState.sourceUrls?.[propId]) {
    return currentState.sourceUrls[propId];
  }
  // 2. Check tenders cache for a matching call
  const callMatch = currentCalls.find((c) => c.id === propId || (c.title && c.title.includes(propId)));
  if (callMatch?.url) return callMatch.url;
  // 3. No valid URL — return empty
  return '';
}

/* ── View switching ─────────────────────────────────────── */

function setActiveView(view) {
  activeView = view;
  document.querySelectorAll('.view').forEach((node) => {
    node.classList.toggle('is-active', node.id === `view-${view}`);
  });
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === view);
  });
}

/* ── Fill forms ─────────────────────────────────────────── */

function fillSettingsForm() {
  document.getElementById('tracking-enabled').checked = currentSettings.tracking.enabled;
  document.getElementById('tracking-rent').checked = currentSettings.tracking.checkRent;
  document.getElementById('tracking-sale').checked = currentSettings.tracking.checkSale;
  document.getElementById('tracking-notify-new').checked = currentSettings.tracking.notifyNew;
  document.getElementById('tracking-notify-stage').checked = currentSettings.tracking.notifyStage;
}

function renderFilterInputs() {
  suppressFilterEvents = true;

  ['city', 'activity'].forEach((type) => {
    if (dropdownState[type]) {
      dropdownState[type].forEach(item => { item.selected = currentState.filters[type].includes(item.value); });
      const firstLabel = type === 'city' ? t('allCities') : t('allActivities');
      updateDropdownLabel(type, firstLabel);

      const panel = document.getElementById(`panel-${type}`);
      if (panel) {
        Array.from(panel.querySelectorAll('input[type="checkbox"]')).forEach((cb) => {
          const checked = currentState.filters[type].includes(cb.value);
          cb.checked = checked;
          cb.closest('.dropdown-option')?.classList.toggle('is-selected', checked);
        });
      }
    }
  });

  document.getElementById('filter-street').value = currentState.filters.street;

  // Range sliders
  const minAreaSlider = document.getElementById('filter-min-area');
  const maxAreaSlider = document.getElementById('filter-max-area');
  const minPriceSlider = document.getElementById('filter-min-price');
  const maxPriceSlider = document.getElementById('filter-max-price');

  if (currentState.filters.minArea) minAreaSlider.value = currentState.filters.minArea;
  if (currentState.filters.maxArea && currentState.filters.maxArea <= Number(maxAreaSlider.max)) {
    maxAreaSlider.value = currentState.filters.maxArea;
  }
  if (currentState.filters.minPrice) minPriceSlider.value = currentState.filters.minPrice;
  if (currentState.filters.maxPrice && currentState.filters.maxPrice <= Number(maxPriceSlider.max)) {
    maxPriceSlider.value = currentState.filters.maxPrice;
  }

  updateSliderUI('area');
  updateSliderUI('price');

  document.getElementById('filter-only-tagged').checked = currentState.filters.onlyTagged;
  document.getElementById('filter-only-bidded').checked = currentState.filters.onlyBidded;
  document.getElementById('filter-show-blocked').checked = currentState.filters.showBlocked;
  suppressFilterEvents = false;
}

function readFiltersForm() {
  const minArea = Number(document.getElementById('filter-min-area').value) || 0;
  const maxArea = Number(document.getElementById('filter-max-area').value) || 0;
  const minPrice = Number(document.getElementById('filter-min-price').value) || 0;
  const maxPrice = Number(document.getElementById('filter-max-price').value) || 0;

  const maxAreaSlider = document.getElementById('filter-max-area');
  const maxPriceSlider = document.getElementById('filter-max-price');

  return normalizeFilters({
    city: dropdownState.city.filter(i => i.selected).map(i => i.value),
    activity: dropdownState.activity.filter(i => i.selected).map(i => i.value),
    street: document.getElementById('filter-street').value,
    minArea,
    maxArea: maxArea >= Number(maxAreaSlider.max) ? 0 : maxArea,
    minPrice,
    maxPrice: maxPrice >= Number(maxPriceSlider.max) ? 0 : maxPrice,
    onlyTagged: document.getElementById('filter-only-tagged').checked,
    onlyBidded: document.getElementById('filter-only-bidded').checked,
    showBlocked: document.getElementById('filter-show-blocked').checked
  });
}

/* ── Range Slider UI ────────────────────────────────────── */

function updateSliderUI(type) {
  const minSlider = document.getElementById(`filter-min-${type === 'area' ? 'area' : 'price'}`);
  const maxSlider = document.getElementById(`filter-max-${type === 'area' ? 'area' : 'price'}`);
  const rangeEl = document.getElementById(`${type}-slider-range`);
  const labelEl = document.getElementById(`${type}-range-label`);

  const min = Number(minSlider.value);
  const max = Number(maxSlider.value);
  const sliderMax = Number(maxSlider.max);

  const pctMin = (min / sliderMax) * 100;
  const pctMax = (max / sliderMax) * 100;

  if (rangeEl) {
    rangeEl.style.left = `${pctMin}%`;
    rangeEl.style.width = `${Math.max(0, pctMax - pctMin)}%`;
  }

  if (labelEl) {
    const unit = type === 'area' ? ' m²' : ' €';
    const minLabel = min > 0 ? formatNumber(min) : '0';
    const maxLabel = max >= sliderMax ? '∞' : formatNumber(max);
    labelEl.textContent = `${minLabel} – ${maxLabel}${unit}`;
  }
}

function enforceSliderConstraint(type, changed) {
  const minSlider = document.getElementById(`filter-min-${type}`);
  const maxSlider = document.getElementById(`filter-max-${type}`);

  let minVal = Number(minSlider.value);
  let maxVal = Number(maxSlider.value);
  const totalRange = Number(maxSlider.max);

  const minStepGap = Number(minSlider.step) * 2;
  const pctGap = Math.floor(totalRange * 0.05);
  const gap = Math.max(minStepGap, pctGap) || (type === 'area' ? 10 : 100);

  if (maxVal - minVal < gap) {
    if (changed === 'min') {
      minSlider.value = maxVal - gap;
    } else {
      maxSlider.value = minVal + gap;
    }
  }
  updateSliderUI(type);
}

/* ── Select / filter rendering ──────────────────────────── */

function updateDropdownLabel(type, firstLabel) {
  const labelEl = document.getElementById(`label-${type}`);
  if (!labelEl) return;
  const selected = dropdownState[type].filter(item => item.selected).map(item => item.value);

  if (selected.length === 0) {
    labelEl.textContent = firstLabel;
  } else if (selected.length <= 2) {
    labelEl.textContent = selected.join(', ');
  } else {
    labelEl.textContent = `${selected.length} odabrano`;
  }
}

function renderSelectOptions(dropdownId, firstLabel, values, selectedValues) {
  const type = dropdownId.replace('filter-', '');
  const panel = document.getElementById(`panel-${type}`);
  if (!panel) return;

  const list = [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'hr'));

  const selectedSet = new Set(Array.isArray(selectedValues) ? selectedValues : []);

  dropdownState[type] = list.map(val => ({ value: val, selected: selectedSet.has(val) }));

  const fragment = document.createDocumentFragment();
  dropdownState[type].forEach((item) => {
    const div = document.createElement('label');
    div.className = 'dropdown-option';
    if (item.selected) div.classList.add('is-selected');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.selected;
    cb.value = item.value;
    cb.addEventListener('change', () => {
      item.selected = cb.checked;
      div.classList.toggle('is-selected', cb.checked);
      updateDropdownLabel(type, firstLabel);
      queueFilterSave();
    });

    const span = document.createElement('span');
    span.textContent = item.value;
    span.title = item.value;

    div.appendChild(cb);
    div.appendChild(span);
    fragment.appendChild(div);
  });

  panel.replaceChildren(fragment);
  updateDropdownLabel(type, firstLabel);
}

/* ── Page summary ───────────────────────────────────────── */

function renderPageSummary() {
  const pill = document.getElementById('active-page-pill');
  const context = document.getElementById('page-context');
  const hint = document.getElementById('filter-range-hint');

  pill.classList.remove('good', 'warn');

  if (!pageSummary) {
    pill.textContent = t('noData');
    pill.classList.add('warn');
    context.textContent = t('pageContextHint');
    hint.textContent = '';
    renderSelectOptions('filter-city', t('allCities'), [], currentState.filters.city);
    renderSelectOptions('filter-activity', t('allActivities'), [], currentState.filters.activity);
    renderFilterInputs();
    return;
  }

  if (!pageSummary.hasListings) {
    pill.textContent = t('noItems');
    pill.classList.add('warn');
    context.textContent = t('pageContextNoItems');
    hint.textContent = '';
    renderSelectOptions('filter-city', t('allCities'), pageSummary.options?.cities || [], currentState.filters.city);
    renderSelectOptions('filter-activity', t('allActivities'), pageSummary.options?.activities || [], currentState.filters.activity);
    renderFilterInputs();
    return;
  }

  pill.textContent = t('connected');
  pill.classList.add('good');
  context.textContent = t('pageContextActive');

  const options = pageSummary.options || {};

  // Update slider max values based on page data
  const areaMax = Math.max(Math.ceil(options.areaMax || 1000), 100);
  const priceMax = Math.max(Math.ceil(options.priceMax || 5000), 100);

  document.getElementById('filter-min-area').max = areaMax;
  document.getElementById('filter-max-area').max = areaMax;
  document.getElementById('filter-min-price').max = priceMax;
  document.getElementById('filter-max-price').max = priceMax;

  // If max slider was at its old max, reset to new max
  const maxAreaSlider = document.getElementById('filter-max-area');
  if (!currentState.filters.maxArea || currentState.filters.maxArea >= areaMax) {
    maxAreaSlider.value = areaMax;
  }
  const maxPriceSlider = document.getElementById('filter-max-price');
  if (!currentState.filters.maxPrice || currentState.filters.maxPrice >= priceMax) {
    maxPriceSlider.value = priceMax;
  }

  hint.textContent = `${t('lblArea')}: ${formatNumber(options.areaMin || 0)} – ${formatNumber(options.areaMax || 0)} m²  ·  ${t('lblPrice')}: ${formatNumber(options.priceMin || 0)} – ${formatNumber(options.priceMax || 0)} EUR`;

  renderSelectOptions('filter-city', t('allCities'), options.cities || [], currentState.filters.city);
  renderSelectOptions('filter-activity', t('allActivities'), options.activities || [], currentState.filters.activity);
  renderFilterInputs();
}

/* ── Meta panel ─────────────────────────────────────────── */

function updateMetaPanel(lastCheckedIso, bytes) {
  document.getElementById('meta-last-check').textContent = formatDate(lastCheckedIso);
  document.getElementById('meta-storage').textContent = formatBytes(bytes);

  const activePageText = activeTab?.url
    ? (() => {
      try {
        const parsed = new URL(activeTab.url);
        return `${parsed.hostname}${parsed.pathname}`;
      } catch {
        return '-';
      }
    })()
    : '-';

  document.getElementById('meta-active-page').textContent = activePageText;
}

/* ── Dashboard stats ────────────────────────────────────── */

function renderDashboardStats() {
  const managedIds = getManagedIds(currentState);
  document.getElementById('stat-managed').textContent = String(managedIds.size);
  document.getElementById('stat-bids').textContent = String(Object.keys(currentState.bids || {}).length);
  document.getElementById('stat-hidden').textContent = String((currentState.blocked || []).length);
  document.getElementById('stat-visible').textContent = pageSummary?.stats?.visible !== undefined ? String(pageSummary.stats.visible) : '-';
}

/* ── Unified Feed ───────────────────────────────────────── */

function renderFeed() {
  renderFeedCategoryButtons();

  const list = document.getElementById('feed-body');
  list.innerHTML = '';

  const items = [];
  const activeCategory = currentSettings.feedCategory || 'all';
  const categoryFilteredCalls = activeCategory === 'all'
    ? currentCalls
    : currentCalls.filter((call) => getCallCategory(call) === activeCategory);

  /* Fetch all calls and use publicationDate or firstSeenAt for sorting */
  const sortedCalls = [...categoryFilteredCalls]
    .sort((a, b) => getCallSortTimestamp(b) - getCallSortTimestamp(a))
    .slice(0, 80);

  sortedCalls.forEach((call) => {
    const category = getCallCategory(call);
    items.push({
      type: 'tender',
      title: call.title || call.id,
      meta: normalizeCategory(call) || '-',
      category,
      stage: call.stage || (call.active === false ? (currentLang === 'en' ? 'Inactive' : 'Neaktivno') : (currentLang === 'en' ? 'Active' : 'Aktivno')),
      active: call.active !== false,
      deadline: call.deadline || '',
      publicationDate: call.publicationDate || '',
      date: call.publicationDate || call.firstSeenAt || call.lastSeenAt,
      url: call.url,
      badges: call.badges || [],
      noticesUrl: call.noticesUrl || '',
      resultsUrl: call.resultsUrl || ''
    });
  });

  const emptyEl = document.getElementById('feed-empty');
  emptyEl.hidden = items.length > 0;

  /* We still update the notification badge for unseen alerts */
  const badge = document.getElementById('notification-count');
  badge.textContent = String(currentNotifications.length || 0);
  badge.hidden = (currentNotifications.length === 0);

  items.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'feed-card';
    card.style.animation = `cardEnter var(--dur-entrance) var(--ease-smooth) ${Math.min(idx * 20, 300)}ms both`;

    /* Icon */
    const icon = document.createElement('div');
    icon.className = `feed-icon type-tender`;
    icon.innerHTML = `<i class="fas fa-building" aria-hidden="true"></i>`;

    /* Body */
    const body = document.createElement('div');
    body.className = 'feed-body';

    const title = document.createElement('h3');
    title.className = 'feed-title';
    title.textContent = item.title;

    const meta = document.createElement('span');
    const kindBadgeClass = item.category === 'sale' ? 'info' : (item.category === 'rent' ? 'warn' : 'muted');
    meta.className = `badge ${kindBadgeClass}`;
    meta.textContent = item.meta;
    meta.style.marginBottom = 'var(--space-xs)';
    meta.style.display = 'inline-block';

    const chips = document.createElement('div');
    chips.className = 'feed-chips';

    if (item.stage) {
      const stageBadge = document.createElement('span');
      const normalizedStage = String(item.stage || '').toLowerCase();
      const isClosed = item.active === false || normalizedStage.includes('zatvoren') || normalizedStage.includes('closed') || normalizedStage.includes('inactive') || normalizedStage.includes('istekao');
      const isOpen = normalizedStage.includes('otvoren') || normalizedStage.includes('open') || normalizedStage.includes('active');
      stageBadge.className = `badge ${isClosed ? 'danger' : (isOpen ? 'good' : 'muted')}`;
      stageBadge.textContent = item.stage;
      chips.appendChild(stageBadge);
    }

    if (item.deadline) {
      const deadlineChip = document.createElement('span');
      deadlineChip.className = 'feed-chip';
      deadlineChip.textContent = `${t('feedDeadline')} ${formatDateShort(item.deadline)}`;
      chips.appendChild(deadlineChip);
    }

    const timeChip = document.createElement('span');
    timeChip.className = 'feed-chip';
    if (item.publicationDate) {
      timeChip.textContent = timeAgo(item.publicationDate) || formatDateShort(item.publicationDate);
    } else {
      timeChip.textContent = timeAgo(item.date) || formatDateShort(item.date);
    }
    chips.appendChild(timeChip);

    body.append(title, meta, chips);

    /* Actions */
    const actions = document.createElement('div');
    actions.className = 'feed-actions';
    actions.style.display = 'flex';
    actions.style.flexDirection = 'column';
    actions.style.gap = 'var(--space-xs)';

    if (item.url) {
      const openBtn = document.createElement('button');
      openBtn.className = 'btn-inline';
      openBtn.type = 'button';
      openBtn.textContent = t('feedOpen');
      openBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: item.url });
      });
      actions.appendChild(openBtn);
    }

    if (item.noticesUrl) {
      const noticesBtn = document.createElement('button');
      noticesBtn.className = 'btn-inline';
      noticesBtn.type = 'button';
      noticesBtn.textContent = 'Obavijesti';
      noticesBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: item.noticesUrl });
      });
      actions.appendChild(noticesBtn);
    }

    if (item.resultsUrl) {
      const resBtn = document.createElement('button');
      resBtn.className = 'btn-inline';
      resBtn.type = 'button';
      resBtn.textContent = 'Rezultati';
      resBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: item.resultsUrl });
      });
      actions.appendChild(resBtn);
    }

    card.append(icon, body, actions);
    list.appendChild(card);
  });
}

/* ── Filter match (for stat modal) ──────────────────────── */

function recordMatchesFilters(record, filters) {
  if (!record) return false;
  if (record.hidden && !filters.showBlocked) return false;
  if (filters.city && filters.city.length > 0 && !filters.city.includes(record.city)) return false;
  if (filters.activity && filters.activity.length > 0 && !filters.activity.includes(record.activity)) return false;
  if (filters.street && !String(record.street || '').toLowerCase().includes(filters.street.toLowerCase())) return false;
  if (filters.minArea && Number(record.area || 0) < filters.minArea) return false;
  if (filters.maxArea && Number(record.area || 0) > filters.maxArea) return false;
  if (filters.minPrice && Number(record.price || 0) < filters.minPrice) return false;
  if (filters.maxPrice && Number(record.price || 0) > filters.maxPrice) return false;
  if (filters.onlyTagged && (!Array.isArray(record.tags) || record.tags.length === 0)) return false;
  if (filters.onlyBidded && !record.bidded) return false;
  return true;
}

/* ── Stat modal ─────────────────────────────────────────── */

function createActionCell(actions = []) {
  const cell = document.createElement('td');
  cell.className = 'actions-cell';
  actions.forEach((config) => {
    const btn = document.createElement('button');
    btn.className = 'btn-inline';
    btn.type = 'button';
    if (config.icon) {
      const i = document.createElement('i');
      i.className = config.icon;
      btn.appendChild(i);
      btn.appendChild(document.createTextNode(' ' + config.label));
    } else {
      btn.textContent = config.label;
    }
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

/* ── Confirm dialog ─────────────────────────────────────── */

function confirmClearAllData() {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const message = document.getElementById('confirm-modal-message');
    const cancelBtn = document.getElementById('btn-confirm-cancel');
    const confirmBtn = document.getElementById('btn-confirm-ok');

    titleEl.textContent = t('confirmDeleteTitle');
    message.textContent = t('confirmDeleteMsg');
    confirmBtn.textContent = t('confirmDeleteBtn');
    modal.hidden = false;
    confirmBtn.focus();

    const cleanup = (approved) => {
      modal.hidden = true;
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
      modal.removeEventListener('click', onOverlayClick);
      document.removeEventListener('keydown', onKeyDown);
      resolve(approved);
    };

    const onCancel = () => cleanup(false);
    const onConfirm = () => cleanup(true);
    const onOverlayClick = (event) => {
      if (event.target.id === 'confirm-modal') cleanup(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') cleanup(false);
    };

    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', onConfirm);
    modal.addEventListener('click', onOverlayClick);
    document.addEventListener('keydown', onKeyDown);
  });
}

/* ── State mutation ─────────────────────────────────────── */

async function updateState(mutator) {
  const latest = await chrome.storage.local.get(['nhr_state']);
  const state = normalizeState(latest.nhr_state || currentState);
  mutator(state);
  currentState = state;
  await chrome.storage.local.set({ nhr_state: state });
}

/* ── Show stat detail rows ──────────────────────────────── */

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
      const propUrl = resolvePropertyUrl(id);
      if (propUrl) {
        const link = document.createElement('a');
        link.href = propUrl;
        link.target = '_blank';
        link.textContent = id;
        link.style.textDecoration = 'underline';
        link.style.color = 'var(--color-primary-safe, var(--color-accent))';
        idCell.appendChild(link);
      } else {
        idCell.textContent = id;
      }

      const tagsCell = document.createElement('td');
      if (!tags.length) tagsCell.textContent = '-';
      tags.forEach((tag) => tagsCell.appendChild(createTagPill(tag)));

      const bidCell = document.createElement('td');
      bidCell.textContent = bid ? (bid.price ? formatCurrency(bid.price) : t('marked')) : '-';

      const hiddenCell = document.createElement('td');
      hiddenCell.textContent = hidden ? t('yes') : t('no');

      const actions = [];
      if (hidden) {
        actions.push({
          label: t('actionShow'),
          icon: 'fas fa-eye',
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
          label: t('actionRemoveBid'),
          icon: 'fas fa-trash-can',
          onClick: async () => {
            await updateState((state) => { delete state.bids[id]; });
            await loadData();
            await showStatDetails('managed');
          }
        });
      }

      row.append(idCell, tagsCell, bidCell, hiddenCell, createActionCell(actions));
      rows.push(row);
    });

    setStatModalContent(t('modalManaged'), [t('thId'), t('thTags'), t('thBid'), t('thHidden'), t('thActions')], rows);
  }

  if (type === 'bids') {
    Object.entries(currentState.bids || {}).forEach(([id, bid]) => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      const propUrl = resolvePropertyUrl(id);
      if (propUrl) {
        const link = document.createElement('a');
        link.href = propUrl;
        link.target = '_blank';
        link.textContent = id;
        link.style.textDecoration = 'underline';
        link.style.color = 'var(--color-primary-safe, var(--color-accent))';
        idCell.appendChild(link);
      } else {
        idCell.textContent = id;
      }

      const priceCell = document.createElement('td'); priceCell.textContent = bid?.price ? formatCurrency(bid.price) : '-';
      const dateCell = document.createElement('td'); dateCell.textContent = bid?.date || '-';
      const noteCell = document.createElement('td'); noteCell.textContent = bid?.note || '-';

      const actionCell = createActionCell([{
        label: t('actionRemoveBid'),
        icon: 'fas fa-trash-can',
        onClick: async () => {
          await updateState((state) => { delete state.bids[id]; });
          await loadData();
          await showStatDetails('bids');
        }
      }]);

      row.append(idCell, priceCell, dateCell, noteCell, actionCell);
      rows.push(row);
    });

    setStatModalContent(t('modalBids'), [t('thId'), t('thRent'), t('thDate'), t('thNote'), t('thActions')], rows);
  }

  if (type === 'hidden') {
    (currentState.blocked || []).forEach((id) => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      const propUrl = resolvePropertyUrl(id);
      if (propUrl) {
        const link = document.createElement('a');
        link.href = propUrl;
        link.target = '_blank';
        link.textContent = id;
        link.style.textDecoration = 'underline';
        link.style.color = 'var(--color-primary-safe, var(--color-accent))';
        idCell.appendChild(link);
      } else {
        idCell.textContent = id;
      }

      const tagsCell = document.createElement('td');
      const tags = currentState.tags[id] || [];
      if (!tags.length) tagsCell.textContent = '-';
      tags.forEach((tag) => tagsCell.appendChild(createTagPill(tag)));

      const bidCell = document.createElement('td');
      const bid = currentState.bids[id];
      bidCell.textContent = bid ? (bid.price ? formatCurrency(bid.price) : t('marked')) : '-';

      const actionCell = createActionCell([{
        label: t('actionShow'),
        icon: 'fas fa-eye',
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

    setStatModalContent(t('modalHidden'), [t('thId'), t('thTags'), t('thBid'), t('thActions')], rows);
  }

  if (type === 'visible') {
    const records = Array.isArray(pageSummary?.records) ? pageSummary.records : [];
    records.filter((record) => recordMatchesFilters(record, currentState.filters)).forEach((record) => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td'); idCell.textContent = record.propId;
      const cityCell = document.createElement('td'); cityCell.textContent = record.city || '-';
      const streetCell = document.createElement('td'); streetCell.textContent = record.street || '-';
      const activityCell = document.createElement('td'); activityCell.textContent = record.activity || '-';
      const priceCell = document.createElement('td'); priceCell.textContent = formatCurrency(record.price || 0);

      const actionCell = createActionCell([{
        label: record.hidden ? t('actionShow') : t('actionHide'),
        icon: record.hidden ? 'fas fa-eye' : 'fas fa-eye-slash',
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

    setStatModalContent(t('modalVisible'), [t('thId'), t('thCity'), t('thAddress'), t('thActivity'), t('thRent'), t('thActions')], rows);
  }

  openStatModal();
}

/* ── Page refresh ───────────────────────────────────────── */

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
  if (!silent) showStatus(t('toastDataRefreshed'));
}

/* ── Filter persistence ─────────────────────────────────── */

async function persistFilters(filters, { silent = true } = {}) {
  const latest = await chrome.storage.local.get(['nhr_state']);
  const mergedState = normalizeState(latest.nhr_state || currentState);
  mergedState.filters = normalizeFilters(filters);
  currentState = mergedState;
  await chrome.storage.local.set({ nhr_state: mergedState });
  if (!silent) showStatus(t('toastFiltersReset'));
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

/* ── Auto-save settings ─────────────────────────────────── */

async function autoSaveSettings() {
  const newSettings = normalizeSettings({
    ...currentSettings,
    tracking: {
      enabled: document.getElementById('tracking-enabled').checked,
      checkRent: document.getElementById('tracking-rent').checked,
      checkSale: document.getElementById('tracking-sale').checked,
      notifyNew: document.getElementById('tracking-notify-new').checked,
      notifyStage: document.getElementById('tracking-notify-stage').checked
    }
  });

  currentSettings = newSettings;
  await chrome.storage.local.set({ nhr_settings: currentSettings });
}

/* ── Side panel ─────────────────────────────────────────── */

async function openNativeSidePanel() {
  if (!chrome.sidePanel) {
    showStatus('Side panel not available.', true);
    return;
  }

  try {
    await sendRuntimeMessage({ type: 'nhr-open-sidepanel', tabId: activeTab?.id || null });
    if (!isSidePanelContext) window.close();
  } catch {
    showStatus('Side panel not available.', true);
  }
}

/* ── Theme cycle ────────────────────────────────────────── */

async function cycleThemeMode() {
  const index = THEME_ORDER.indexOf(currentSettings.theme);
  const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
  currentSettings = normalizeSettings({ ...currentSettings, theme: next });
  applyTheme(next);
  updateThemeIcon();
  await chrome.storage.local.set({ nhr_settings: currentSettings });
  showStatus(`${currentLang === 'en' ? 'Theme' : 'Tema'}: ${themeLabel(next)}`);
}

/* ── Language toggle ────────────────────────────────────── */

async function toggleLanguage() {
  const next = currentSettings.language === 'en' ? 'hr' : 'en';
  currentSettings = normalizeSettings({ ...currentSettings, language: next });
  await chrome.storage.local.set({ nhr_settings: currentSettings });
  applyLanguage();
  renderPageSummary();
  renderFeed();
  showStatus(next === 'en' ? 'Language: English' : 'Jezik: Hrvatski');
}

/* ── Clear notifications ────────────────────────────────── */

async function clearNotifications() {
  await chrome.storage.local.set({ nhr_notifications: [] });
  currentNotifications = [];
  renderFeed();
  showStatus(t('toastNotificationsCleared'));
}

/* ── Refresh page + meta ────────────────────────────────── */

async function refreshPageAndMeta({ silent = false } = {}) {
  await refreshPageSummary({ silent });
  storageBytes = await chrome.storage.local.getBytesInUse();
  updateMetaPanel(currentStorageSnapshot.tenders_last_checked_at, storageBytes);
}

/* ── Load all data ──────────────────────────────────────── */

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
  applyLanguage();
  updateThemeIcon();

  /* Side panel button visibility */
  const sidePanelVisible = chrome.sidePanel && !isSidePanelContext;
  const sidePanelBtn = document.getElementById('btn-open-sidepanel');
  if (sidePanelBtn) sidePanelBtn.style.display = sidePanelVisible ? 'flex' : 'none';

  fillSettingsForm();
  renderFilterInputs();
  storageBytes = await chrome.storage.local.getBytesInUse();

  await refreshPageSummary({ silent: true });
  renderDashboardStats();
  renderFeed();
  updateMetaPanel(storage.tenders_last_checked_at, storageBytes);
}

/* ── Bind all actions ───────────────────────────────────── */

function bindActions() {
  const on = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  };

  /* Navigation */
  on('btn-go-home', 'click', () => setActiveView('home'));

  /* Tab bar */
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) setActiveView(view);
    });
  });

  /* Header actions */
  on('btn-open-sidepanel', 'click', openNativeSidePanel);
  on('btn-theme-cycle', 'click', cycleThemeMode);
  on('btn-lang-toggle', 'click', toggleLanguage);

  /* Home actions */
  on('btn-refresh-page', 'click', async () => {
    await refreshPageAndMeta();
  });

  /* Feed */
  on('btn-clear-notifications', 'click', clearNotifications);
  document.querySelectorAll('.feed-filter-btn[data-feed-category]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const next = btn.dataset.feedCategory;
      if (!['all', 'rent', 'sale'].includes(next)) return;
      if (currentSettings.feedCategory === next) return;
      currentSettings = normalizeSettings({ ...currentSettings, feedCategory: next });
      await chrome.storage.local.set({ nhr_settings: currentSettings });
      renderFeed();
    });
  });

  /* Filters */
  on('btn-reset-filters', 'click', async () => {
    currentState.filters = normalizeFilters(DEFAULT_STATE.filters);
    renderFilterInputs();
    await persistFilters(currentState.filters, { silent: false });
    await refreshPageSummary({ silent: true });
  });

  ['filter-only-tagged', 'filter-only-bidded', 'filter-show-blocked'].forEach((id) => {
    on(id, 'change', queueFilterSave);
  });

  ['filter-street'].forEach((id) => {
    on(id, 'input', queueFilterSave);
  });

  /* Custom dropdow listeners */
  ['city', 'activity'].forEach((type) => {
    const btn = document.getElementById(`dropdown-btn-${type}`);
    if (btn) {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-panel')) return;
        const wasOpen = btn.classList.contains('is-open');
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('is-open'));
        if (!wasOpen) btn.classList.add('is-open');
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('is-open'));
    }
  });

  /* Range sliders */
  ['filter-min-area', 'filter-max-area'].forEach((id) => {
    on(id, 'input', () => {
      enforceSliderConstraint('area', id.includes('min') ? 'min' : 'max');
      queueFilterSave();
    });
  });
  ['filter-min-price', 'filter-max-price'].forEach((id) => {
    on(id, 'input', () => {
      enforceSliderConstraint('price', id.includes('min') ? 'min' : 'max');
      queueFilterSave();
    });
  });

  /* Settings: auto-save on every toggle change */
  ['tracking-enabled', 'tracking-rent', 'tracking-sale', 'tracking-notify-new', 'tracking-notify-stage'].forEach((id) => {
    on(id, 'change', autoSaveSettings);
  });

  /* Data */
  on('btn-export-json', 'click', () => {
    const payload = JSON.stringify({
      nhr_state: currentState,
      nhr_settings: currentSettings,
      tenders_cache: currentStorageSnapshot.tenders_cache || {},
      tenders_last_checked_at: currentStorageSnapshot.tenders_last_checked_at || null,
      nhr_notifications: currentNotifications,
      exported_at: new Date().toISOString()
    }, null, 2);
    downloadBlob(new Blob([payload], { type: 'application/json' }), `nhr_backup_${new Date().toISOString().slice(0, 10)}.json`);
    showStatus(t('toastExportJson'));
  });

  on('btn-export-csv', 'click', () => {
    const csv = buildCsv(currentState);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `nhr_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    showStatus(t('toastExportCsv'));
  });

  on('import-file', 'change', (event) => {
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
        showStatus(t('toastImportOk'));
      } catch {
        showStatus(t('toastImportErr'), true);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  });

  on('btn-clear', 'click', async () => {
    if (!(await confirmClearAllData())) return;
    await chrome.storage.local.remove([
      'nhr_state', 'nhr_settings', 'tenders_cache', 'tenders_last_checked_at', 'tenders_last_result', 'nhr_notifications'
    ]);
    currentState = normalizeState(DEFAULT_STATE);
    await loadData();
    showStatus(t('toastDataCleared'));
  });

  /* Stat cards → modal */
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

  /* Modals */
  on('btn-close-stat-modal', 'click', closeStatModal);
  on('stat-modal', 'click', (event) => {
    if (event.target?.id === 'stat-modal') closeStatModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeStatModal();
  });

  /* Tab listeners */
  chrome.tabs.onActivated.addListener(async () => {
    await refreshPageSummary({ silent: true });
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status !== 'complete') return;
    const focusedTab = await getActiveTab();
    if (!focusedTab?.id || focusedTab.id !== tabId) return;
    await refreshPageSummary({ silent: true });
  });

  chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;
    await refreshPageSummary({ silent: true });
  });

  /* Storage sync */
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return;
    if (changes.nhr_state || changes.nhr_settings || changes.tenders_cache || changes.tenders_last_checked_at || changes.nhr_notifications) {
      await loadData();
    }
  });
}

/* ── Init ───────────────────────────────────────────────── */

(async function init() {
  closeStatModal();
  await detectViewContext();
  await loadData();
  bindActions();
  setActiveView('home');
})();
