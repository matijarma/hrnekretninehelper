const POLL_ALARM_NAME = 'check_tenders';
const SIDE_PANEL_PATH = 'popup/popup.html';

const CATEGORY_URLS = {
  rent: 'https://hr-nekretnine.hr/vrsta-natjecaja/zakup-poslovnih-prostora/',
  sale: 'https://hr-nekretnine.hr/vrsta-natjecaja/prodaja-nekretnina/'
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

const TEXT = {
  hr: {
    newTitle: 'Novi natječaj',
    newBody: 'Objavljen je novi natječaj.',
    stageTitle: 'Promjena faze natječaja',
    stageFallback: 'Faza ažurirana',
    openButton: 'Otvori natječaj'
  },
  en: {
    newTitle: 'New tender',
    newBody: 'A new tender has been published.',
    stageTitle: 'Tender stage changed',
    stageFallback: 'Stage updated',
    openButton: 'Open tender'
  }
};

void syncSidePanelBehavior();

chrome.runtime.onInstalled.addListener(async () => {
  await syncSidePanelBehavior();
  await ensureSettings();
  await scheduleFromSettings();
  await checkTenders();
});

chrome.runtime.onStartup.addListener(async () => {
  await syncSidePanelBehavior();
  await ensureSettings();
  await scheduleFromSettings();
  await checkTenders();
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes.nhr_settings) {
    await scheduleFromSettings();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === POLL_ALARM_NAME) {
    checkTenders();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'nhr-run-check-now') {
    checkTenders(true)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === 'nhr-open-sidepanel') {
    openSidePanelForTab(sender?.tab?.id || message?.tabId)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  return false;
});

chrome.notifications.onClicked.addListener((notificationId) => {
  openNotificationCall(notificationId);
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    openNotificationCall(notificationId);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (!chrome.sidePanel) return;
  openSidePanelForTab(tab?.id).catch(() => {
    // ignore
  });
});

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

async function syncSidePanelBehavior() {
  if (!chrome.sidePanel) {
    return;
  }

  try {
    if (chrome.action?.setPopup) {
      await chrome.action.setPopup({ popup: '' });
    }
  } catch {
    // ignore
  }

  try {
    if (chrome.sidePanel.setPanelBehavior) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
    if (chrome.sidePanel.setOptions) {
      await chrome.sidePanel.setOptions({ path: SIDE_PANEL_PATH, enabled: true });
    }
  } catch {
    // ignore
  }
}

async function resolveActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0]?.id || null;
}

async function openSidePanelForTab(tabId) {
  if (!chrome.sidePanel?.open) {
    return;
  }

  const targetTabId = tabId || (await resolveActiveTabId());
  if (!targetTabId) {
    return;
  }

  if (chrome.sidePanel.setOptions) {
    await chrome.sidePanel.setOptions({
      tabId: targetTabId,
      path: SIDE_PANEL_PATH,
      enabled: true
    });
  }

  await chrome.sidePanel.open({ tabId: targetTabId });
}

async function ensureSettings() {
  const storage = await chrome.storage.local.get(['nhr_settings']);
  const normalized = normalizeSettings(storage.nhr_settings || DEFAULT_SETTINGS);
  await chrome.storage.local.set({ nhr_settings: normalized });
  return normalized;
}

function resolveLanguage(setting) {
  if (setting === 'hr' || setting === 'en') return setting;
  const uiLang = (chrome.i18n.getUILanguage?.() || 'hr').toLowerCase();
  return uiLang.startsWith('hr') ? 'hr' : 'en';
}

function tx(settings) {
  const lang = resolveLanguage(settings.language);
  return TEXT[lang] || TEXT.hr;
}

async function scheduleFromSettings() {
  const storage = await chrome.storage.local.get(['nhr_settings']);
  const settings = normalizeSettings(storage.nhr_settings || DEFAULT_SETTINGS);
  const tracking = settings.tracking;

  const hasCategory = tracking.checkRent || tracking.checkSale;
  if (!tracking.enabled || !hasCategory) {
    await chrome.alarms.clear(POLL_ALARM_NAME);
    return;
  }

  chrome.alarms.create(POLL_ALARM_NAME, {
    periodInMinutes: tracking.intervalMinutes
  });
}

function buildNotificationId(url) {
  return `nhr|${encodeURIComponent(url)}|${Date.now()}`;
}

function parseUrlFromNotificationId(notificationId) {
  if (!notificationId || !notificationId.startsWith('nhr|')) return '';
  const parts = notificationId.split('|');
  if (parts.length < 2) return '';
  try {
    return decodeURIComponent(parts[1]);
  } catch {
    return '';
  }
}

function openNotificationCall(notificationId) {
  const url = parseUrlFromNotificationId(notificationId);
  if (url) {
    chrome.tabs.create({ url });
  }
  chrome.notifications.clear(notificationId);
}

async function appendNotificationLog(entry) {
  const storage = await chrome.storage.local.get(['nhr_notifications']);
  const list = Array.isArray(storage.nhr_notifications) ? storage.nhr_notifications : [];
  list.unshift(entry);
  await chrome.storage.local.set({ nhr_notifications: list.slice(0, 150) });
}

function notifyCall(settings, type, callData, oldStage = '') {
  const text = tx(settings);
  const isNew = type === 'new';
  const title = isNew ? text.newTitle : text.stageTitle;

  let message = '';
  if (isNew) {
    message = callData.title || text.newBody;
  } else {
    const stage = callData.stage || text.stageFallback;
    const prefix = oldStage ? `${oldStage} -> ${stage}` : stage;
    message = `${callData.title} | ${prefix}`;
  }

  const notificationId = buildNotificationId(callData.url || CATEGORY_URLS.rent);

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 2,
    buttons: [{ title: text.openButton }]
  });

  appendNotificationLog({
    id: notificationId,
    type,
    title,
    message,
    url: callData.url || '',
    callId: callData.id || '',
    stage: callData.stage || '',
    oldStage: oldStage || '',
    deadline: callData.deadline || '',
    createdAt: new Date().toISOString()
  }).catch(() => {
    // ignore
  });
}

async function parseCallListFromCategory(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return [];

  const html = await response.text();
  const list = await chrome.runtime.sendMessage({
    type: 'parse-call-list',
    target: 'offscreen',
    html,
    url
  });

  return Array.isArray(list) ? list : [];
}

async function parseCallDetail(callUrl) {
  try {
    const response = await fetch(callUrl, { cache: 'no-store' });
    if (!response.ok) return null;

    const html = await response.text();
    const detail = await chrome.runtime.sendMessage({
      type: 'parse-call-detail',
      target: 'offscreen',
      html,
      url: callUrl
    });

    return detail && typeof detail === 'object' ? detail : null;
  } catch {
    return null;
  }
}

async function checkTenders(manual = false) {
  const storage = await chrome.storage.local.get(['nhr_settings', 'tenders_cache']);
  const settings = normalizeSettings(storage.nhr_settings || DEFAULT_SETTINGS);
  const tracking = settings.tracking;

  const result = {
    ok: true,
    checkedCategories: 0,
    checkedCalls: 0,
    newCalls: 0,
    stageChanges: 0,
    skipped: false
  };

  const selectedUrls = [];
  if (tracking.checkRent) selectedUrls.push(CATEGORY_URLS.rent);
  if (tracking.checkSale) selectedUrls.push(CATEGORY_URLS.sale);

  if (!tracking.enabled || selectedUrls.length === 0) {
    result.skipped = true;
    await chrome.storage.local.set({ tenders_last_checked_at: new Date().toISOString() });
    return result;
  }

  await setupOffscreenDocument('background/offscreen.html');

  const now = new Date().toISOString();
  const cache = storage.tenders_cache || {};
  const seenIds = new Set();

  for (const categoryUrl of selectedUrls) {
    result.checkedCategories += 1;

    const calls = await parseCallListFromCategory(categoryUrl);

    for (const call of calls) {
      result.checkedCalls += 1;

      const detail = call.url ? await parseCallDetail(call.url) : null;
      const current = {
        ...call,
        stage: detail?.stage || call.stage || '',
        deadline: detail?.deadline || call.deadline || '',
        stageDetails: detail?.stageDetails || call.stageDetails || '',
        fingerprint: detail?.fingerprint || call.fingerprint || `${call.title}|${call.stage}|${call.deadline}`,
        lastSeenAt: now,
        categoryUrl
      };

      seenIds.add(current.id);

      const previous = cache[current.id];
      if (!previous) {
        current.firstSeenAt = now;
        current.lastChangedAt = now;
        cache[current.id] = current;
        result.newCalls += 1;

        if (tracking.notifyNew) {
          notifyCall(settings, 'new', current);
        }
        continue;
      }

      const changed = previous.fingerprint !== current.fingerprint;
      current.firstSeenAt = previous.firstSeenAt || now;
      current.lastChangedAt = changed ? now : (previous.lastChangedAt || previous.firstSeenAt || now);
      cache[current.id] = { ...previous, ...current };

      if (changed) {
        result.stageChanges += 1;
        if (tracking.notifyStage) {
          notifyCall(settings, 'stage', current, previous.stage || '');
        }
      }
    }
  }

  Object.keys(cache).forEach((id) => {
    if (!seenIds.has(id)) {
      cache[id] = {
        ...cache[id],
        active: false,
        lastSeenAt: cache[id].lastSeenAt || now
      };
    } else {
      cache[id] = {
        ...cache[id],
        active: true
      };
    }
  });

  await chrome.storage.local.set({
    tenders_cache: cache,
    tenders_last_checked_at: now,
    tenders_last_result: {
      ...result,
      manual,
      ranAt: now
    }
  });

  return result;
}

let creating;

async function setupOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (contexts.length > 0) return;

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['DOM_PARSER'],
      justification: 'Parsiranje stranica natjeÄaja bez prikaza dodatnog suÄelja.'
    });
    await creating;
    creating = null;
  }
}

