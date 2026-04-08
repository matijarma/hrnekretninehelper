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

/* â”€â”€ Croatian month name â†’ number mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const MONTH_MAP_HR = {
  sijecnja: 1, sijecanj: 1, januar: 1,
  veljace: 2, veljaca: 2, februar: 2,
  ozujka: 3, ozujak: 3, mart: 3,
  travnja: 4, travanj: 4, april: 4,
  svibnja: 5, svibanj: 5, maj: 5,
  lipnja: 6, lipanj: 6, jun: 6,
  srpnja: 7, srpanj: 7, jul: 7,
  kolovoza: 8, kolovoz: 8, august: 8,
  rujna: 9, rujan: 9, septembar: 9,
  listopada: 10, listopad: 10, oktobar: 10,
  studenoga: 11, studenog: 11, studeni: 11, novembar: 11,
  prosinca: 12, prosinac: 12, decembar: 12
};
function parseTime(text) {
  const match = String(text || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return { hours: 0, minutes: 0 };
  return {
    hours: parseInt(match[1], 10) || 0,
    minutes: parseInt(match[2], 10) || 0
  };
}

/**
 * Parse a Croatian date string like "24. travnja 2026." or "21. oÅ¾ujka 2026."
 * into an ISO date string.
 */
function parseCroatianDate(text) {
  if (!text) return '';
  const normalized = normalizeWhitespace(text);
  // Pattern: "24. travnja 2026." or "24. travnja 2026. 12:00"
  const match = normalized.match(/(\d{1,2})\.\s*([\p{L}.]+)\s+(\d{4})\.?/u);
  if (!match) return '';
  const day = parseInt(match[1], 10);
  const monthName = stripAccents(match[2]).replace(/\.$/, '');
  const year = parseInt(match[3], 10);
  const month = MONTH_MAP_HR[monthName];
  if (!month || !day || !year) return '';
  const { hours, minutes } = parseTime(normalized);
  const date = new Date(year, month - 1, day, hours, minutes);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
}

/**
 * Also handle numeric date format "dd.mm.yyyy."
 */
function parseNumericDate(text) {
  if (!text) return '';
  const normalized = normalizeWhitespace(text);
  const match = normalized.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\.?/);
  if (!match) return '';
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (!day || !month || !year || month > 12 || day > 31) return '';
  const { hours, minutes } = parseTime(normalized);
  const date = new Date(year, month - 1, day, hours, minutes);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
}

/**
 * Try to extract a date from text, trying Croatian names first, then numeric.
 */
function extractDate(text) {
  return parseCroatianDate(text) || parseNumericDate(text);
}

function extractStage(text) {
  const normalized = stripAccents(text);
  if (!normalized) return '';

  if (normalized.includes('otvoren') && !normalized.includes('zatvoren')) {
    return 'Otvoren';
  }
  if (normalized.includes('zatvoren') || normalized.includes('istekao')) {
    return 'Zatvoreno';
  }
  if (normalized.includes('otvaranje') && normalized.includes('ponud')) {
    return 'Otvaranje ponuda';
  }
  if (normalized.includes('rok') && normalized.includes('predaju')) {
    return 'Predaja ponuda';
  }
  if (normalized.includes('pregled') || normalized.includes('otvorenih vrata')) {
    return 'Dani otvorenih vrata';
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

/**
 * Extract natjeÄaj list from the category page HTML.
 * Targets the actual HTML structure:
 *   <a class="item" href="https://hr-nekretnine.hr/natjecaji/.../">
 *     <div class="item_meta ...">NatjeÄaj otvoren do 24. travnja 2026. 12:00</div>
 *     <div>Obavijesti</div>
 *     <div>Rezultati natjeÄaja</div>
 *     <h5>NatjeÄaj za zakup poslovnih prostora Z-3/26</h5>
 *     <div>Datum objave: 21. oÅ¾ujka 2026.</div>
 *   </a>
 */
function extractCallLinks(doc, baseUrl) {
  // Primary selector: a.item elements that link to /natjecaji/
  const anchors = Array.from(doc.querySelectorAll('a.item[href*="/natjecaji/"]'));

  // Fallback: if no a.item found, try broader selector
  const effectiveAnchors = anchors.length > 0
    ? anchors
    : Array.from(doc.querySelectorAll('a[href*="/natjecaji/"]'));

  const results = [];
  const seen = new Set();

  effectiveAnchors.forEach((anchor) => {
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

    // Extract title from h5, h4, h3 inside the anchor
    const titleEl = anchor.querySelector('h5, h4, h3, h2');
    const title = normalizeWhitespace(titleEl?.textContent || '');
    if (!title || title.length < 4) return;

    // Filter out zapoÅ¡ljavanje and other unrelated stuff
    const nHref = stripAccents(href);
    const nTitle = stripAccents(title);
    if (!nHref.includes('zakup') && !nHref.includes('prodaja') && !nTitle.includes('zakup') && !nTitle.includes('prodaj')) {
      return;
    }

    // Extract meta info (deadline + status) from .item_meta div
    const metaEl = anchor.querySelector('.item_meta, [class*="item_meta"]');
    const metaText = normalizeWhitespace(metaEl?.textContent || '');

    // Extract deadline from meta text
    // E.g., "NatjeÄaj otvoren do 24. travnja 2026. 12:00"
    // E.g., "NatjeÄaj zatvoren (20. oÅ¾ujka 2026. 12:00)"
    let deadline = '';
    if (metaText) {
      // Try "do DD. month YYYY." pattern first
      const doMatch = metaText.match(/do\s+(\d{1,2}\.\s*[\p{L}.]+\s+\d{4}\.?(?:\s+\d{1,2}:\d{2})?)/iu);
      if (doMatch) {
        deadline = parseCroatianDate(doMatch[1]);
      }
      // Try parenthesized date "(DD. month YYYY. HH:MM)"
      if (!deadline) {
        const parenMatch = metaText.match(/\((\d{1,2}\.\s*[\p{L}.]+\s+\d{4}\.?(?:\s+\d{1,2}:\d{2})?)\)/iu);
        if (parenMatch) {
          deadline = parseCroatianDate(parenMatch[1]);
        }
      }
      // General fallback
      if (!deadline) {
        deadline = extractDate(metaText);
      }
    }

    // Extract stage/status
    const stage = extractStage(metaText);

    // Extract publication date from "Datum objave: DD. month YYYY."
    let publicationDate = '';
    const dateEl = anchor.querySelector('.item_date');
    if (dateEl) {
      const divText = normalizeWhitespace(dateEl.textContent);
      if (divText.toLowerCase().includes('datum objave')) {
        const colonPart = divText.split(':').slice(1).join(':');
        publicationDate = parseCroatianDate(colonPart) || extractDate(colonPart);
      } else {
        publicationDate = parseCroatianDate(divText) || extractDate(divText);
      }
    }

    // Check for "Obavijesti" and "Rezultati natjeÄaja" badges
    const badges = [];
    let resultsUrl = '';
    let noticesUrl = '';

    const badgeEls = Array.from(anchor.querySelectorAll('.natjecaj_url, button, .item_meta'));
    badgeEls.forEach(el => {
      const t = normalizeWhitespace(el.textContent);
      const dataUrl = el.getAttribute('data-url') || href;
      if (t.toLowerCase().includes('obavijesti')) {
        badges.push('Obavijesti');
        noticesUrl = dataUrl;
      }
      if (t.toLowerCase().includes('rezultati natje')) {
        badges.push('Rezultati natjeÄaja');
        resultsUrl = dataUrl;
      }
    });

    const fingerprint = [title, stage, deadline, publicationDate].join('|');

    results.push({
      id: buildCallId(href, title),
      title,
      url: href,
      stage,
      active: stage !== 'Zatvoreno',
      deadline,
      publicationDate,
      badges,
      resultsUrl,
      noticesUrl,
      stageDetails: metaText.slice(0, 400),
      fingerprint
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

  // Look for deadline in the page
  const bodyText = normalizeWhitespace(doc.body?.textContent || '');

  // Try to find "Rok za podnoÅ¡enje ponuda: DD. month YYYY. HH:MM"
  let deadline = '';
  const rokMatch = bodyText.match(/Rok za podno[šs]enje ponuda[:\s]*(\d{1,2}\.\s*[\p{L}.]+\s+\d{4}\.?(?:\s+\d{1,2}:\d{2})?)/iu);
  if (rokMatch) {
    deadline = parseCroatianDate(rokMatch[1]);
  }

  // Also try meta elements
  if (!deadline) {
    const metaEl = doc.querySelector('.item_meta, [class*="item_meta"]');
    if (metaEl) {
      const metaText = normalizeWhitespace(metaEl.textContent);
      const doMatch = metaText.match(/do\s+(\d{1,2}\.\s*[\p{L}.]+\s+\d{4}\.?(?:\s+\d{1,2}:\d{2})?)/iu);
      if (doMatch) {
        deadline = parseCroatianDate(doMatch[1]);
      }
    }
  }

  // Publication date
  let publicationDate = '';
  const publicationCandidates = Array.from(doc.querySelectorAll('.item_date, time, .entry-date, .published'));
  for (const node of publicationCandidates) {
    const text = normalizeWhitespace(node.textContent || '');
    if (!text) continue;
    const candidate = text.toLowerCase().includes('datum objave')
      ? text.split(':').slice(1).join(':')
      : text;
    publicationDate = parseCroatianDate(candidate) || extractDate(candidate);
    if (publicationDate) break;
  }

  if (!publicationDate) {
    const pubMatch = bodyText.match(/Natje[čc]aj objavljen[:\s]*(\d{1,2}\.\s*[\p{L}.]+\s+\d{4})/iu);
    if (pubMatch) {
      publicationDate = parseCroatianDate(pubMatch[1]);
    }
  }

  // Stage detection
  const stageSources = [];
  doc.querySelectorAll('.item_meta, aside, .natjecaj-info, .entry-content p, .entry-content li, .content p, .content li').forEach((el) => {
    const txt = normalizeWhitespace(el.textContent);
    if (!txt) return;
    const normalized = stripAccents(txt);
    if (
      normalized.includes('natjecaj') ||
      normalized.includes('rok') ||
      normalized.includes('ponud') ||
      normalized.includes('pregled') ||
      normalized.includes('otvaranje') ||
      normalized.includes('otvoren') ||
      normalized.includes('zatvoren')
    ) {
      stageSources.push(txt);
    }
  });

  const sourceText = stageSources.join(' | ') || bodyText.slice(0, 2000);
  const stage = extractStage(sourceText);

  const stageDetails = normalizeWhitespace(sourceText).slice(0, 700);
  const fingerprint = [title, stage, deadline, publicationDate, stageDetails].join('|');

  return {
    title,
    stage,
    deadline,
    publicationDate,
    stageDetails,
    fingerprint,
    detailUrl: callUrl
  };
}


