chrome.runtime.onMessage.addListener(handleMessages);

function handleMessages(message, sender, sendResponse) {
  if (message.target !== 'offscreen') {
    return false;
  }

  if (message.type === 'parse-call-list') {
    parseCallList(message.html, message.url).then(sendResponse);
    return true;
  }

  if (message.type === 'parse-call-detail') {
    parseCallDetail(message.html, message.url).then(sendResponse);
    return true;
  }

  return false;
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripAccents(value) {
  return normalizeWhitespace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function extractDates(text) {
  const matches = normalizeWhitespace(text).match(/\d{1,2}\.\d{1,2}\.\d{4}\./g) || [];
  return [...new Set(matches)];
}

function extractStage(text) {
  const normalized = stripAccents(text);
  if (!normalized) return '';

  if (normalized.includes('otvaranje') && normalized.includes('ponud')) {
    return 'Otvaranje ponuda';
  }
  if (normalized.includes('rok') && normalized.includes('predaju')) {
    return 'Predaja ponuda';
  }
  if (normalized.includes('pregled') || normalized.includes('otvorenih vrata')) {
    return 'Dani otvorenih vrata';
  }
  if (normalized.includes('zatvoren') || normalized.includes('istekao')) {
    return 'Zatvoreno';
  }

  return '';
}

function buildCallId(url, fallbackTitle = '') {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('natjecaji');
    if (idx >= 0 && parts[idx + 1]) {
      return parts[idx + 1].toUpperCase();
    }
  } catch {
    // ignore
  }

  const title = normalizeWhitespace(fallbackTitle);
  if (!title) return `CALL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  return `CALL-${Math.abs(hash).toString(36).toUpperCase()}`;
}

function extractCallLinks(doc, baseUrl) {
  const anchors = Array.from(doc.querySelectorAll('a[href*="/natjecaji/"]'));
  const results = [];
  const seen = new Set();

  anchors.forEach((anchor) => {
    const rawHref = anchor.getAttribute('href');
    if (!rawHref) return;

    let href = '';
    try {
      const parsed = new URL(rawHref, baseUrl);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('natjecaji');
      if (idx === -1 || !parts[idx + 1]) return;
      href = parsed.toString();
    } catch {
      return;
    }

    if (seen.has(href)) return;
    seen.add(href);

    const container = anchor.closest('article, li, .item, .card, .post, .row, .col-12, section, div');
    const titleCandidate =
      normalizeWhitespace(anchor.textContent) ||
      normalizeWhitespace(anchor.getAttribute('title')) ||
      normalizeWhitespace(container?.querySelector('h1, h2, h3, h4')?.textContent);

    if (!titleCandidate || titleCandidate.length < 4) return;

    const contextText = normalizeWhitespace(container?.textContent || anchor.textContent);
    const stage = extractStage(contextText);
    const dates = extractDates(contextText);

    results.push({
      id: buildCallId(href, titleCandidate),
      title: titleCandidate,
      url: href,
      stage,
      deadline: dates[0] || '',
      stageDetails: contextText.slice(0, 400),
      fingerprint: [titleCandidate, stage, dates.join('|')].join('|')
    });
  });

  return results;
}

async function parseCallList(html, pageUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const list = extractCallLinks(doc, pageUrl);

  return list;
}

async function parseCallDetail(html, callUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title =
    normalizeWhitespace(doc.querySelector('h1, h2.entry-title, .entry-title, .page-title')?.textContent) ||
    normalizeWhitespace(doc.title || '');

  const stageSources = [];
  doc.querySelectorAll('aside, .natjecaj-info, .entry-content p, .entry-content li, .content p, .content li').forEach((el) => {
    const txt = normalizeWhitespace(el.textContent);
    if (!txt) return;

    const normalized = stripAccents(txt);
    if (
      normalized.includes('natjecaj') ||
      normalized.includes('rok') ||
      normalized.includes('ponud') ||
      normalized.includes('pregled') ||
      normalized.includes('otvaranje')
    ) {
      stageSources.push(txt);
    }
  });

  const sourceText = stageSources.join(' | ') || normalizeWhitespace(doc.body?.textContent || '');
  const stage = extractStage(sourceText);
  const dates = extractDates(sourceText);

  const stageDetails = normalizeWhitespace(sourceText).slice(0, 700);
  const fingerprint = [title, stage, dates.join('|'), stageDetails].join('|');

  return {
    title,
    stage,
    deadline: dates[0] || '',
    stageDetails,
    fingerprint,
    detailUrl: callUrl
  };
}
