(() => {
  if (window.__NHR_EXTENSION_ACTIVE__) return;
  window.__NHR_EXTENSION_ACTIVE__ = true;

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
    theme: 'auto'
  };

  const I18N = {
    hr: {
      hideListing: 'Sakrij',
      unhideListing: 'Prikaži',
      tagsAction: 'Oznake',
      bidAction: 'Ponuda',
      bidEditAction: 'Uredi ponudu',
      bidAddAction: 'Dodaj ponudu',
      bidRemoveAction: 'Makni ponudu',
      hiddenNotice: 'Oglas skriven',
      restoreListing: 'Prikaži oglas',
      bidBadge: 'Ponuda',
      repeater: 'Povratnik',
      tagModalTitle: 'Oznake',
      tagHelp: 'Klikni preset ili dodaj vlastitu oznaku.',
      add: 'Dodaj',
      cancel: 'Odustani',
      save: 'Spremi',
      noTags: 'Nema oznaka',
      newTagPlaceholder: 'Nova oznaka',
      bidModalTitle: 'Ponuda',
      bidPrice: 'Iznos ponude (EUR)',
      bidDate: 'Datum predaje',
      bidNote: 'Bilješke, napomene...',
      clearBidDetails: 'Očisti detalje',
      saveBid: 'Spremi detalje'
    },
    en: {
      hideListing: 'Hide',
      unhideListing: 'Restore',
      tagsAction: 'Tags',
      bidAction: 'Bid',
      bidEditAction: 'Edit bid',
      bidAddAction: 'Add bid',
      bidRemoveAction: 'Remove bid',
      hiddenNotice: 'Listing hidden',
      restoreListing: 'Restore listing',
      bidBadge: 'Bid',
      repeater: 'Repeater',
      tagModalTitle: 'Tags',
      tagHelp: 'Use presets or add a custom tag.',
      add: 'Add',
      cancel: 'Cancel',
      save: 'Save',
      noTags: 'No tags',
      newTagPlaceholder: 'New tag',
      bidModalTitle: 'Bid',
      bidPrice: 'Bid amount (EUR)',
      bidDate: 'Submission date',
      bidNote: 'Notes...',
      clearBidDetails: 'Clear details',
      saveBid: 'Save details'
    }
  };

  const PRESET_TAGS = {
    hr: ['Prijavljeno', 'Zanimljivo', 'Pregledano', 'Ništa zanimljivo'],
    en: ['Applied', 'Interesting', 'Reviewed', 'Not interesting']
  };

  const icons = {
    hide: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
    show: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    tag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13.41 20.6a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
    bid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    edit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>`
  };

  let appState = structuredClone(DEFAULT_STATE);
  let settings = structuredClone(DEFAULT_SETTINGS);
  let currentLang = 'hr';
  let records = [];
  let stateSignature = JSON.stringify(appState);

  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  const tr = (key) => I18N[currentLang]?.[key] || I18N.hr[key] || key;

  function normalizeState(raw = {}) {
    const filters = raw.filters && typeof raw.filters === 'object' ? raw.filters : {};
    return {
      blocked: Array.isArray(raw.blocked) ? [...new Set(raw.blocked.map((id) => String(id).trim()).filter(Boolean))] : [],
      tags: raw.tags && typeof raw.tags === 'object' ? raw.tags : {},
      bids: raw.bids && typeof raw.bids === 'object' ? raw.bids : {},
      sourceUrls: raw.sourceUrls && typeof raw.sourceUrls === 'object' ? raw.sourceUrls : {},
      filters: {
        city: Array.isArray(filters.city) ? filters.city : (filters.city ? [String(filters.city)] : []),
        activity: Array.isArray(filters.activity) ? filters.activity : (filters.activity ? [String(filters.activity)] : []),
        street: String(filters.street || ''),
        minArea: Number.parseFloat(filters.minArea) || 0,
        maxArea: Number.parseFloat(filters.maxArea) || 0,
        minPrice: Number.parseFloat(filters.minPrice) || 0,
        maxPrice: Number.parseFloat(filters.maxPrice) || 0,
        onlyTagged: Boolean(filters.onlyTagged),
        onlyBidded: Boolean(filters.onlyBidded),
        showBlocked: Boolean(filters.showBlocked)
      }
    };
  }

  function normalizeSettings(raw = {}) {
    return {
      language: ['hr', 'en', 'auto'].includes(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
      theme: ['auto', 'light', 'dark'].includes(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme
    };
  }

  function updateStateSignature() {
    stateSignature = JSON.stringify(appState);
  }

  function resolveLanguage(pref) {
    if (pref === 'hr' || pref === 'en') return pref;
    const ui = (chrome.i18n.getUILanguage?.() || navigator.language || 'hr').toLowerCase();
    return ui.startsWith('hr') ? 'hr' : 'en';
  }

  function setLanguage() {
    currentLang = resolveLanguage(settings.language);
  }

  function applyTheme() {
    const root = document.documentElement;
    root.classList.remove('nhr-theme-dark', 'nhr-theme-light');
    if (settings.theme === 'dark' || (settings.theme === 'auto' && themeMedia.matches)) {
      root.classList.add('nhr-theme-dark');
    } else {
      root.classList.add('nhr-theme-light');
    }
  }

  function trackSourceUrl(propId) {
    if (propId && !appState.sourceUrls[propId]) {
      appState.sourceUrls[propId] = window.location.href;
    }
  }

  function syncState() {
    updateStateSignature();
    return chrome.storage.local.set({ nhr_state: appState });
  }

  function cleanInjectedUi() {
    document.querySelectorAll('.nhr-fab, .nhr-sidebar, .nhr-sidebar-overlay, .nhr-inline-filters, .nhr-unhide-bar, .nhr-modal-overlay, .nhr-badge-container, .nhr-item-actions').forEach((el) => el.remove());
    document.querySelectorAll('.nhr-managed-row').forEach((row) => {
      row.classList.remove('nhr-managed-row', 'nhr-row-hidden', 'nhr-row-repeater');
      row.style.display = '';
    });
  }

  function safeText(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function parseListing(listingEl) {
    const titleEl = listingEl.querySelector('h2.h4, h3, h4');
    const title = titleEl ? titleEl.textContent.trim() : '';

    let propId = '';
    const match = title.match(/\(([^)]+)\)/);
    if (match && match[1]) propId = match[1].trim();
    else propId = btoa(encodeURIComponent(title || Math.random().toString())).substring(0, 15);

    const dls = listingEl.querySelectorAll('dl dt, dl dd');
    let city = '';
    let street = '';
    let activity = '';
    let area = 0;
    let price = 0;

    for (let i = 0; i < dls.length - 1; i += 1) {
      const dt = dls[i];
      const dd = dls[i + 1];
      if (dt.tagName !== 'DT') continue;

      const term = dt.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const val = dd.textContent.trim();

      if (term.includes('grad') || term.includes('mjesto')) city = val;
      if (term.includes('adresa') || term.includes('ulica')) street = val;
      if (term.includes('predlozena djelatnost') || term.includes('predlozena namjena')) activity = val;
      if (term.includes('povrsina')) area = Number.parseFloat(val.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
      if (term.includes('cijena') || term.includes('iznos') || term.includes('zakupnina')) {
        price = Number.parseFloat(val.replace('.', '').replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
      }
    }

    return { propId, city, street, activity, area, price };
  }

  function collectRecords() {
    const listings = Array.from(document.querySelectorAll('.tab-pane_item'));
    records = listings.map((listing, index) => {
      const row = listing.closest('.row');
      if (!row) return null;
      const data = parseListing(listing);
      row.dataset.nhrId = data.propId;
      row.dataset.nhrCity = data.city;
      row.dataset.nhrActivity = data.activity;
      row.dataset.nhrStreet = data.street;
      row.dataset.nhrArea = String(data.area);
      row.dataset.nhrPrice = String(data.price);
      row.classList.add('nhr-managed-row');
      return { row, listing, data, index };
    }).filter(Boolean);
  }

  function formatPrice(value) {
    return new Intl.NumberFormat(currentLang === 'hr' ? 'hr-HR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(Number.parseFloat(value) || 0);
  }

  function hashTag(tag) {
    let hash = 0;
    const source = String(tag || '');
    for (let i = 0; i < source.length; i += 1) {
      hash = ((hash << 5) - hash) + source.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function applyTagTone(element, tag) {
    const hue = hashTag(tag) % 360;
    const isDark = document.documentElement.classList.contains('nhr-theme-dark');
    const textLightness = isDark ? 72 : 34;
    element.style.borderColor = `hsla(${hue}, 78%, 42%, 0.56)`;
    element.style.background = `hsla(${hue}, 84%, 50%, 0.14)`;
    element.style.color = `hsl(${hue}, 70%, ${textLightness}%)`;
  }

  function applyHideBar(record) {
    if (!appState.blocked.includes(record.data.propId)) return;
    const safeId = `nhr-unhide-${record.data.propId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    if (record.row.previousElementSibling?.id === safeId) return;

    const html = `
      <div class="nhr-unhide-bar" id="${safeId}">
        <span>${safeText(tr('hiddenNotice'))} (${safeText(record.data.propId)})</span>
        <button class="nhr-unhide-btn">${safeText(tr('restoreListing'))}</button>
      </div>
    `;
    record.row.insertAdjacentHTML('beforebegin', html);
    const bar = document.getElementById(safeId);
    bar.querySelector('.nhr-unhide-btn').addEventListener('click', async () => {
      appState.blocked = appState.blocked.filter((id) => id !== record.data.propId);
      await syncState();
      renderAll();
    });
  }

  function renderRecord(record) {
    const { listing, row, data } = record;
    listing.style.position = 'relative';

    applyHideBar(record);

    const actions = document.createElement('div');
    actions.className = 'nhr-item-actions';
    const blocked = appState.blocked.includes(data.propId);
    const hasBid = Boolean(appState.bids[data.propId]);

    actions.innerHTML = `
      <button class="nhr-icon-btn tag" title="${safeText(tr('tagsAction'))}">${icons.tag}</button>
      <button class="nhr-icon-btn bid ${hasBid ? 'active' : ''}" title="${safeText(hasBid ? tr('bidRemoveAction') : tr('bidAddAction'))}">${icons.bid}</button>
      ${hasBid ? `<button class="nhr-icon-btn edit" title="${safeText(tr('bidEditAction'))}">${icons.edit}</button>` : ''}
      <button class="nhr-icon-btn hide" title="${safeText(blocked ? tr('unhideListing') : tr('hideListing'))}">${blocked ? icons.show : icons.hide}</button>
    `;

    const tagBtn = actions.querySelector('.nhr-icon-btn.tag');
    const bidBtn = actions.querySelector('.nhr-icon-btn.bid');
    const editBidBtn = actions.querySelector('.nhr-icon-btn.edit');
    const hideBtn = actions.querySelector('.nhr-icon-btn.hide');
    tagBtn.addEventListener('click', () => openTagModal(data.propId));

    bidBtn.addEventListener('click', async () => {
      if (hasBid) {
        delete appState.bids[data.propId];
      } else {
        trackSourceUrl(data.propId);
        appState.bids[data.propId] = {
          markedAt: new Date().toISOString(),
          price: '',
          date: '',
          note: ''
        };
      }
      await syncState();
      renderAll();
    });

    editBidBtn?.addEventListener('click', () => openBidModal(data.propId));

    hideBtn.addEventListener('click', async () => {
      if (appState.blocked.includes(data.propId)) {
        appState.blocked = appState.blocked.filter((id) => id !== data.propId);
      } else {
        trackSourceUrl(data.propId);
        appState.blocked.push(data.propId);
      }
      await syncState();
      renderAll();
    });

    listing.appendChild(actions);

    const badges = document.createElement('div');
    badges.className = 'nhr-badge-container';

    (appState.tags[data.propId] || []).forEach((tag) => {
      const badge = document.createElement('span');
      badge.className = 'nhr-badge';
      badge.textContent = tag;
      applyTagTone(badge, tag);
      badges.appendChild(badge);
    });

    if (appState.bids[data.propId]) {
      const bidBadge = document.createElement('span');
      bidBadge.className = 'nhr-badge bidded';
      const bidValue = appState.bids[data.propId];
      bidBadge.textContent = bidValue?.price ? `${tr('bidBadge')}: ${formatPrice(bidValue.price)}` : tr('bidBadge');
      badges.appendChild(bidBadge);

      const repeater = document.createElement('span');
      repeater.className = 'nhr-badge repeater';
      repeater.textContent = tr('repeater');
      badges.appendChild(repeater);
      row.classList.add('nhr-row-repeater');
    }

    const title = listing.querySelector('h2.h4, h3, h4');
    if (title) title.insertAdjacentElement('afterend', badges);
    else listing.prepend(badges);
  }

  function sortRepeatersToTop() {
    const container = records[0]?.row?.parentElement;
    if (!container) return;

    const repeaters = records.filter((r) => appState.bids[r.data.propId]);
    repeaters.reverse().forEach((r) => {
      const first = container.querySelector('.row');
      if (first && first !== r.row) container.insertBefore(r.row, first);
    });
  }

  function currentCities() {
    return [...new Set(records.map((r) => r.data.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'hr'));
  }

  function currentActivities() {
    return [...new Set(records.map((r) => r.data.activity).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'hr'));
  }

  function applyFilters() {
    records.forEach((record) => {
      const { row, data } = record;
      const hidden = appState.blocked.includes(data.propId);
      const tags = appState.tags[data.propId] || [];
      const bid = appState.bids[data.propId];

      let visible = true;
      if (hidden && !appState.filters.showBlocked) visible = false;
      if (appState.filters.city && appState.filters.city.length > 0 && !appState.filters.city.includes(data.city)) visible = false;
      if (appState.filters.activity && appState.filters.activity.length > 0 && !appState.filters.activity.includes(data.activity)) visible = false;
      if (appState.filters.street && !data.street.toLowerCase().includes(appState.filters.street.toLowerCase())) visible = false;
      if (appState.filters.minArea && data.area < appState.filters.minArea) visible = false;
      if (appState.filters.maxArea && data.area > appState.filters.maxArea) visible = false;
      if (appState.filters.minPrice && data.price < appState.filters.minPrice) visible = false;
      if (appState.filters.maxPrice && data.price > appState.filters.maxPrice) visible = false;
      if (appState.filters.onlyTagged && !tags.length) visible = false;
      if (appState.filters.onlyBidded && !bid) visible = false;

      row.classList.toggle('nhr-row-hidden', hidden && !appState.filters.showBlocked);
      row.style.display = visible ? '' : 'none';

      const bar = row.previousElementSibling?.classList.contains('nhr-unhide-bar') ? row.previousElementSibling : null;
      if (bar) bar.style.display = hidden && !appState.filters.showBlocked ? '' : 'none';
    });
  }

  function getRenderStats() {
    return {
      total: records.length,
      visible: records.filter((record) => record.row.style.display !== 'none').length,
      hidden: appState.blocked.length,
      bids: Object.keys(appState.bids).length,
      tagged: Object.keys(appState.tags || {}).filter((id) => (appState.tags[id] || []).length > 0).length
    };
  }

  function getPageSummary() {
    const areas = records.map((record) => record.data.area).filter((value) => value > 0);
    const prices = records.map((record) => record.data.price).filter((value) => value > 0);

    return {
      ok: true,
      hasListings: records.length > 0,
      currentUrl: window.location.href,
      filters: { ...appState.filters },
      stats: getRenderStats(),
      records: records.map((record) => ({
        propId: record.data.propId,
        city: record.data.city,
        street: record.data.street,
        activity: record.data.activity,
        area: record.data.area,
        price: record.data.price,
        hidden: appState.blocked.includes(record.data.propId),
        tags: appState.tags[record.data.propId] || [],
        bidded: Boolean(appState.bids[record.data.propId])
      })),
      options: {
        cities: currentCities(),
        activities: currentActivities(),
        areaMin: areas.length ? Math.min(...areas) : 0,
        areaMax: areas.length ? Math.max(...areas) : 0,
        priceMin: prices.length ? Math.min(...prices) : 0,
        priceMax: prices.length ? Math.max(...prices) : 0
      }
    };
  }

  function openTagModal(propId) {
    const overlay = document.createElement('div');
    overlay.className = 'nhr-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'nhr-modal';

    const selected = [...new Set(Array.isArray(appState.tags[propId]) ? appState.tags[propId] : [])];
    const presets = PRESET_TAGS[currentLang] || PRESET_TAGS.hr;

    modal.innerHTML = `
      <h3>${safeText(tr('tagModalTitle'))}: ${safeText(propId)}</h3>
      <p class="nhr-modal-subtitle">${safeText(tr('tagHelp'))}</p>
      <div class="nhr-tag-presets">${presets.map((tag) => `<button class="nhr-tag-preset ${selected.includes(tag) ? 'active' : ''}" data-tag="${safeText(tag)}">${safeText(tag)}</button>`).join('')}</div>
      <div class="nhr-tag-current" id="nhr-tag-current"></div>
      <div class="nhr-tag-custom-wrap">
        <input id="nhr-tag-custom" placeholder="${safeText(tr('newTagPlaceholder'))}">
        <button class="nhr-btn nhr-btn-secondary" id="nhr-tag-add">${safeText(tr('add'))}</button>
      </div>
      <div class="nhr-modal-actions">
        <button class="nhr-btn nhr-btn-secondary" id="nhr-tag-cancel">${safeText(tr('cancel'))}</button>
        <button class="nhr-btn nhr-btn-primary" id="nhr-tag-save">${safeText(tr('save'))}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const current = modal.querySelector('#nhr-tag-current');
    const renderCurrent = () => {
      current.replaceChildren();
      if (!selected.length) {
        const empty = document.createElement('span');
        empty.className = 'nhr-empty-state';
        empty.textContent = tr('noTags');
        current.appendChild(empty);
        return;
      }

      selected.forEach((tag) => {
        const chip = document.createElement('button');
        chip.className = 'nhr-tag-chip';
        chip.type = 'button';
        chip.dataset.remove = tag;
        chip.textContent = `${tag} x`;
        applyTagTone(chip, tag);
        current.appendChild(chip);
      });
    };

    renderCurrent();

    modal.querySelectorAll('.nhr-tag-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        const idx = selected.indexOf(tag);
        if (idx >= 0) {
          selected.splice(idx, 1);
          btn.classList.remove('active');
        } else {
          selected.push(tag);
          btn.classList.add('active');
        }
        renderCurrent();
      });
    });

    current.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const tag = target.dataset.remove;
      if (!tag) return;
      const idx = selected.indexOf(tag);
      if (idx >= 0) selected.splice(idx, 1);
      renderCurrent();
    });

    modal.querySelector('#nhr-tag-add').addEventListener('click', () => {
      const input = modal.querySelector('#nhr-tag-custom');
      const value = input.value.trim();
      if (!value || selected.includes(value)) return;
      selected.push(value);
      input.value = '';
      renderCurrent();
    });

    modal.querySelector('#nhr-tag-cancel').addEventListener('click', () => overlay.remove());
    modal.querySelector('#nhr-tag-save').addEventListener('click', async () => {
      if (selected.length) {
        trackSourceUrl(propId);
        appState.tags[propId] = selected;
      } else {
        delete appState.tags[propId];
      }
      await syncState();
      overlay.remove();
      renderAll();
    });
  }

  function openBidModal(propId) {
    const existing = appState.bids[propId] || { markedAt: new Date().toISOString(), price: '', note: '', date: '' };
    const overlay = document.createElement('div');
    overlay.className = 'nhr-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'nhr-modal';

    modal.innerHTML = `
      <h3>${safeText(tr('bidModalTitle'))}: ${safeText(propId)}</h3>
      <input type="number" id="nhr-bid-price" placeholder="${safeText(tr('bidPrice'))}" value="${existing.price || ''}">
      <input type="date" id="nhr-bid-date" aria-label="${safeText(tr('bidDate'))}" value="${existing.date ? String(existing.date).slice(0, 10) : ''}">
      <textarea rows="3" id="nhr-bid-note" placeholder="${safeText(tr('bidNote'))}">${safeText(existing.note || '')}</textarea>
      <div class="nhr-modal-actions">
        <button class="nhr-btn nhr-btn-secondary" id="nhr-bid-cancel">${safeText(tr('cancel'))}</button>
        <button class="nhr-btn nhr-btn-danger" id="nhr-bid-clear">${safeText(tr('clearBidDetails'))}</button>
        <button class="nhr-btn nhr-btn-primary" id="nhr-bid-save">${safeText(tr('saveBid'))}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('#nhr-bid-cancel').addEventListener('click', () => overlay.remove());

    modal.querySelector('#nhr-bid-clear').addEventListener('click', async () => {
      appState.bids[propId] = {
        ...(appState.bids[propId] || {}),
        markedAt: appState.bids[propId]?.markedAt || existing.markedAt || new Date().toISOString(),
        price: '',
        date: '',
        note: ''
      };
      await syncState();
      overlay.remove();
      renderAll();
    });

    modal.querySelector('#nhr-bid-save').addEventListener('click', async () => {
      const rawPrice = modal.querySelector('#nhr-bid-price').value.trim();
      const parsedPrice = Number.parseFloat(rawPrice);
      trackSourceUrl(propId);
      appState.bids[propId] = {
        ...(appState.bids[propId] || {}),
        markedAt: appState.bids[propId]?.markedAt || existing.markedAt || new Date().toISOString(),
        price: Number.isFinite(parsedPrice) ? parsedPrice : '',
        date: modal.querySelector('#nhr-bid-date').value || '',
        note: modal.querySelector('#nhr-bid-note').value.trim()
      };
      await syncState();
      overlay.remove();
      renderAll();
    });
  }

  function renderAll() {
    cleanInjectedUi();
    collectRecords();

    if (!records.length) return;

    records.forEach(renderRecord);
    sortRepeatersToTop();
    applyFilters();
  }

  function watchStorage() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;

      if (changes.nhr_settings) {
        settings = normalizeSettings(changes.nhr_settings.newValue || {});
        setLanguage();
        applyTheme();
        renderAll();
      }

      if (changes.nhr_state) {
        const incoming = normalizeState(changes.nhr_state.newValue || {});
        const incomingSignature = JSON.stringify(incoming);
        if (incomingSignature !== stateSignature) {
          appState = incoming;
          stateSignature = incomingSignature;
          renderAll();
        }
      }
    });
  }

  function watchRuntimeMessages() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || typeof message !== 'object') {
        return false;
      }

      if (message.type === 'nhr-get-page-summary') {
        sendResponse(getPageSummary());
        return false;
      }

      return false;
    });
  }

  function watchDom() {
    const root = document.querySelector('.tab-content') || document.body;
    let timer = null;

    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const nextCount = document.querySelectorAll('.tab-pane_item').length;
        if (nextCount !== records.length) renderAll();
      }, 250);
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  async function init() {
    const data = await chrome.storage.local.get(['nhr_state', 'nhr_settings']);
    appState = normalizeState(data.nhr_state || {});
    updateStateSignature();
    settings = normalizeSettings(data.nhr_settings || {});

    setLanguage();
    applyTheme();

    themeMedia.addEventListener('change', () => {
      if (settings.theme === 'auto') applyTheme();
    });

    renderAll();
    watchStorage();
    watchRuntimeMessages();
    watchDom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

