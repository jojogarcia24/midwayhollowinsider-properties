/* ELR/MHI Offer & Tour Flow — Single Drop-In v3
   Include this ONE file on:
     • Property detail page (index.html)
     • Make Offer page (make-offer.html)
     • Schedule Tour page (schedule-tour.html)
     • Thanks pages (thanks.html, thanks-offer.html)

   Responsibilities:
     1. On property page: read listing data from DOM/URL/window.__LISTING__
        and stash it. Rewrite Make-Offer and Schedule-Tour links to carry a ref.
     2. On offer page: capture submission into sessionStorage before redirect.
     3. On thanks pages: hydrate recap if the page's own script hasn't already.

   Optional data-elr hooks (on your pages):
       data-elr="mls"     on the MLS status element
       data-elr="finance" on the financing <select>
       data-elr="downPct" on the % slider or label
       data-elr="downAmt" on the $ slider or label
*/
(function() {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const text = (sel) => {
    const el = (typeof sel === 'string') ? $(sel) : sel;
    return (el?.textContent || '').trim();
  };
  const attr = (sel, a) => {
    const el = (typeof sel === 'string') ? $(sel) : sel;
    return (el?.getAttribute(a) || '').trim();
  };
  const val = (sel) => {
    const el = (typeof sel === 'string') ? $(sel) : sel;
    if (!el) return '';
    if ('value' in el) return (el.value || '').trim();
    return (el.textContent || '').trim();
  };
  const num = (v) => Number(String(v || '').replace(/[^0-9.]/g, ''));
  const money = (n) => (isFinite(n) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n)) : '—');
  const postLead = (type, payload) => {
    if (!payload || typeof payload !== 'object') return;
    const body = { ...payload, leadType: type, source: 'midwayhollowinsider-properties' };
    // Fire-and-forget lead forwarding; do not block form navigation.
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(() => {});
  };

  /* ---------- READ LISTING FROM CURRENT PAGE ---------- */
  function readListingFromDom() {
    const L = window.__LISTING__ || {};
    const photo = (
      $('#main-photo')?.src ||
      $('[data-photo]')?.src || $('.js-photo')?.src ||
      $('img[alt*="listing" i]')?.src ||
      $('img[itemprop="image"]')?.src ||
      ''
    );
    const ctx = {
      ListingId: L.ListingId || L.MlsId || text('[data-listing-id]') || attr('[data-listing-id]', 'data-listing-id'),
      UnparsedAddress: L.UnparsedAddress || text('#property-address, .js-address, [data-address], #addr'),
      City: L.City || text('[data-city], .js-city'),
      StateOrProvince: L.StateOrProvince || text('[data-state], .js-state'),
      ListPrice: L.ListPrice || num(text('#property-price, .js-price, [data-price], #previewPrice')),
      BedroomsTotal: L.BedroomsTotal || num(text('[data-beds], .js-beds, #beds, #property-beds')),
      BathroomsTotalInteger: L.BathroomsTotalInteger || num(text('[data-baths], .js-baths, #baths, #property-baths')),
      LivingArea: L.LivingArea || L.BuildingAreaTotal || num(text('[data-sqft], .js-sqft, #sqft, #property-sqft')),
      MlsStatus: L.MlsStatus ||
        text('[data-elr="mls"], [data-mls], .mls-status, #mlsStatus, [itemprop="availability"], [data-testid="mlsStatus"]'),
      PhotoUrl: L.PhotoUrl || photo
    };
    const hasAny = Object.values(ctx).some(v => v != null && String(v).trim() !== '');
    return hasAny ? ctx : null;
  }

  /* ---------- STASH CONTEXT + REWRITE LINKS ---------- */
  function maybeSeed() {
    const ctx = readListingFromDom();
    if (!ctx) return;
    const key = `elr_ctx_${ctx.ListingId || Date.now()}`;
    try { localStorage.setItem(key, JSON.stringify(ctx)); } catch {}
    try { sessionStorage.setItem('elr-listing-ref', key); } catch {}
    try {
      const q = new URLSearchParams();
      Object.entries(ctx).forEach(([k, v]) => { if (v) q.set(k, v); });
      sessionStorage.setItem('elr-from', location.origin + location.pathname + '?' + q.toString());
    } catch {}

    // Rewrite make-offer / schedule-tour links to carry ref + listing params
    $$('a[href*="make-offer"], a[href="#make-offer"], .js-make-offer, a[href*="schedule-tour"], a[href="#showing"], .js-schedule-tour').forEach(a => {
      try {
        let href = a.getAttribute('href');
        // Handle anchor-style hrefs
        if (href === '#make-offer') href = '/make-offer.html';
        if (href === '#showing') href = '/schedule-tour.html';
        const u = new URL(href, location.href);
        u.searchParams.set('ref', key);
        // Also pass key listing fields directly in URL for robustness
        Object.entries(ctx).forEach(([k, v]) => { if (v) u.searchParams.set(k, v); });
        a.setAttribute('href', u.toString());
      } catch {}
    });
  }

  /* ---------- CAPTURE OFFER SELECTIONS ---------- */
  function hookOfferForm() {
    const FORM = $('#offer-form');
    if (!FORM) return;

    function getFinance() {
      let v = val('[data-elr="finance"], #financeType, [name="finance"]');
      if (!v) {
        const r = $('input[name*="finance"][type="radio"]:checked');
        if (r) v = r.value;
      }
      return (v || '').trim();
    }
    function getDownPct() {
      let v = val('[data-elr="downPct"], #downPercent, [name="downPercent"]');
      if (!v) v = attr('[data-elr="downPct"]', 'aria-valuenow');
      return num(v);
    }
    function getDownAmt() {
      let v = val('[data-elr="downAmt"], #downAmount, [name="downAmount"]');
      if (!v) v = attr('[data-elr="downAmt"]', 'aria-valuenow');
      return num(v);
    }
    function getOfferAmount() {
      return num(val('#offerAmount, [name="offerAmount"]'));
    }

    FORM.addEventListener('submit', () => {
      try {
        const ref = new URLSearchParams(location.search).get('ref') || sessionStorage.getItem('elr-listing-ref') || '';
        let base = {};
        if (ref) { try { base = JSON.parse(localStorage.getItem(ref) || '{}'); } catch {} }
        // Also bring in URL params (they have listing data too)
        new URLSearchParams(location.search).forEach((v, k) => { if (!base[k] && v) base[k] = v; });

        const offerAmount = getOfferAmount();
        const finance = getFinance();
        let downPercent = getDownPct();
        let downAmount = getDownAmt();

        if (!downPercent && downAmount && offerAmount) downPercent = Math.round((downAmount / offerAmount) * 100);
        if (!downAmount && downPercent && offerAmount) downAmount = Math.round(offerAmount * (downPercent / 100));

        const firstName = val('#firstName, [name="firstName"]');
        const lastName = val('#lastName, [name="lastName"]');
        const email = val('#email, [name="email"]');
        const phone = val('#phone, [name="phone"]');
        const touredBefore = val('#touredBefore, [name="touredBefore"]');
        const notes = val('#notes, [name="notes"]');
        const emailConsent = !!$('#emailConsent')?.checked;
        const smsConsent = !!$('#smsConsent')?.checked;

        const data = Object.assign({}, base, {
          hasOfferAmount: isFinite(offerAmount) && offerAmount > 0,
          offerAmount: isFinite(offerAmount) ? offerAmount : null,
          finance: finance || null,
          downPercent: isFinite(downPercent) ? downPercent : null,
          downAmount: isFinite(downAmount) ? downAmount : null,
          firstName, lastName, email, phone,
          emailConsent, smsConsent,
          touredBefore, notes,
          submittedAt: new Date().toISOString()
        });
        sessionStorage.setItem('elr-offer-submission', JSON.stringify(data));
        postLead('offer', data);
        if (ref) sessionStorage.setItem('elr-thanks-ref', ref);

        // Ensure ref survives to thanks page
        const act = new URL(FORM.getAttribute('action') || '/thanks-offer.html', location.href);
        if (ref) act.searchParams.set('ref', ref);
        FORM.setAttribute('action', act.toString());
      } catch (e) {
        console.warn('[elr-offer] submit capture failed', e);
      }
    }, { once: true });
  }

  /* ---------- CAPTURE TOUR SELECTIONS ---------- */
  function hookTourForm() {
    const FORM = $('#tour-form');
    if (!FORM) return;

    FORM.addEventListener('submit', () => {
      try {
        const ref = new URLSearchParams(location.search).get('ref') || sessionStorage.getItem('elr-listing-ref') || '';
        let listing = {};
        if (ref) { try { listing = JSON.parse(localStorage.getItem(ref) || '{}'); } catch {} }
        new URLSearchParams(location.search).forEach((v, k) => { if (!listing[k] && v) listing[k] = v; });

        const data = {
          tourType: $('input[name="tourType"]:checked')?.value || val('#tourType, [name="tourType"]'),
          tourDate: val('#tourDate, [name="tourDate"]'),
          tourTime: val('#tourTime, [name="tourTime"]'),
          firstName: val('#firstName, [name="firstName"]'),
          lastName: val('#lastName, [name="lastName"]'),
          email: val('#email, [name="email"]'),
          phone: val('#phone, [name="phone"]'),
          emailConsent: !!$('#emailConsent')?.checked,
          smsConsent: !!$('#smsConsent')?.checked,
          workingWithAgent: val('#workingWithAgent, [name="workingWithAgent"]'),
          notes: val('#notes, [name="notes"]'),
          listing,
          submittedAt: new Date().toISOString()
        };
        sessionStorage.setItem('elr-tour-submission', JSON.stringify(data));
        postLead('tour', data);
        if (ref) sessionStorage.setItem('elr-tour-ref', ref);

        const act = new URL(FORM.getAttribute('action') || '/thanks.html', location.href);
        if (ref) act.searchParams.set('ref', ref);
        FORM.setAttribute('action', act.toString());
      } catch (e) {
        console.warn('[elr-offer] tour capture failed', e);
      }
    }, { once: true });
  }

  /* ---------- HYDRATE THANKS (fallback if page script hasn't populated) ---------- */
  function hydrateThanks() {
    const looksLikeThanks = /thanks/.test(location.pathname) || $('#offerLine') || $('[data-elr="offerTotal"]');
    if (!looksLikeThanks) return;

    function getCtx() {
      const url = new URL(location.href);
      const ref = url.searchParams.get('ref') || sessionStorage.getItem('elr-thanks-ref') || sessionStorage.getItem('elr-listing-ref');
      let ctx = {};
      if (ref) { try { const s = localStorage.getItem(ref); if (s) ctx = JSON.parse(s); } catch {} }
      url.searchParams.forEach((v, k) => { if (!ctx[k] && v) ctx[k] = v; });
      try {
        const sub = JSON.parse(sessionStorage.getItem('elr-offer-submission') || sessionStorage.getItem('elr-tour-submission') || '{}');
        ctx = { ...ctx, ...sub };
      } catch {}
      return ctx;
    }

    const d = getCtx();
    const setText = (sels, val) => {
      for (const s of sels) { const el = document.querySelector(s); if (el) { el.textContent = val; return; } }
    };
    const setImg = (sels, src) => {
      for (const s of sels) { const el = document.querySelector(s); if (el && src) { el.src = src; return; } }
    };

    // Only fill elements that are still '—' (don't clobber page-native hydration)
    const fillIfEmpty = (sels, val) => {
      for (const s of sels) {
        const el = document.querySelector(s);
        if (el && (el.textContent.trim() === '—' || el.textContent.trim() === '')) {
          el.textContent = val || '—';
          return;
        }
      }
    };

    setImg(['img[data-elr="photo"]', '#thumb', '#photo', '#elr-photo'], d.PhotoUrl || d.photo);
    fillIfEmpty(['[data-elr="addr"]', '#addr'], d.UnparsedAddress || d.address || '—');
    fillIfEmpty(['[data-elr="city"]', '#cityLine'], [d.City, d.StateOrProvince].filter(Boolean).join(', ') || '—');
    fillIfEmpty(['[data-elr="price"]', '#price'], d.ListPrice ? money(d.ListPrice) : '—');
    fillIfEmpty(['[data-elr="beds"]', '#beds'], (d.BedroomsTotal ?? '—'));
    fillIfEmpty(['[data-elr="baths"]', '#baths'], (d.BathroomsTotalInteger ?? '—'));
    fillIfEmpty(['[data-elr="sqft"]', '#sqft'], d.LivingArea ? Number(d.LivingArea).toLocaleString() : '—');
    fillIfEmpty(['[data-elr="mls"]', '#mlsStatus'], d.MlsStatus || 'Active');
  }

  try { maybeSeed(); } catch (e) { console.warn('[elr-offer] seed failed', e); }
  try { hookOfferForm(); } catch (e) { console.warn('[elr-offer] offer hook failed', e); }
  try { hookTourForm(); } catch (e) { console.warn('[elr-offer] tour hook failed', e); }
  try { hydrateThanks(); } catch (e) { console.warn('[elr-offer] hydrate failed', e); }
})();
