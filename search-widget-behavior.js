/* Midway Hollow Insider — Search Widget Behavior
   Paste the widget HTML (from your snippet) somewhere on your MHI homepage,
   then include this script AFTER it.

   Configure the destination URL at the top (where your property-detail Netlify site lives):
*/
(function() {
  // === CONFIGURE ME ===
  window.MIDWAY_SEARCH_CONFIG = window.MIDWAY_SEARCH_CONFIG || {
    // The property detail Netlify site you're building this weekend:
    resultsPageUrl: 'https://midwayhollowinsider-properties.netlify.app/',
    // Default vendor/MLS feed:
    defaultVendor: 'ntreis'
  };

  const form = document.getElementById('mlsSearchForm');
  if (!form) return;

  const $ = id => document.getElementById(id);

  // Build URL with all the filter params and navigate
  function buildSearchUrl() {
    const base = form.closest('.mls-search-card')?.dataset?.resultsUrl || window.MIDWAY_SEARCH_CONFIG.resultsPageUrl;
    const u = new URL(base, location.href);

    // Map form fields to query params
    const fields = {
      q: $('mlsLocationInput')?.value,
      status: $('mlsStatus')?.value,
      type: $('mlsType')?.value,
      subtype: $('mlsSubtype')?.value,
      beds: $('mlsMinBeds')?.value,
      baths: $('mlsMinBaths')?.value,
      minPrice: $('mlsMinPrice')?.value,
      maxPrice: $('mlsMaxPrice')?.value,
      vendor: $('mlsVendorSelect')?.value || window.MIDWAY_SEARCH_CONFIG.defaultVendor,
      garage: $('mlsGarageSpaces')?.value,
      yearMin: $('mlsYearBuiltMin')?.value,
      yearMax: $('mlsYearBuiltMax')?.value,
      lotMin: $('mlsLotSizeMin')?.value,
      lotMax: $('mlsLotSizeMax')?.value,
      pool: $('mlsHasPool')?.value,
      gated: $('mlsIsGated')?.value,
      school: $('mlsSchoolName')?.value,
      openHouse: $('mlsOpenHouse')?.value
    };

    Object.entries(fields).forEach(([k, v]) => {
      if (v != null && v !== '') u.searchParams.set(k, v);
    });

    return u.toString();
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    window.location.href = buildSearchUrl();
  });

  // Copy-search-link button
  $('mlsSaveBtn')?.addEventListener('click', async function() {
    const url = buildSearchUrl();
    try {
      await navigator.clipboard.writeText(url);
      const orig = this.textContent;
      this.textContent = 'Copied!';
      setTimeout(() => { this.textContent = orig; }, 1500);
    } catch {
      prompt('Copy this search URL:', url);
    }
  });

  // Advanced filters toggle
  $('mlsToggleAdvancedBtn')?.addEventListener('click', function() {
    const adv = $('mlsAdvancedFilters');
    if (!adv) return;
    const isOpen = !adv.hasAttribute('hidden');
    if (isOpen) {
      adv.setAttribute('hidden', '');
      this.textContent = '+ Advanced Filters';
    } else {
      adv.removeAttribute('hidden');
      this.textContent = '− Advanced Filters';
    }
  });

  // Voice search (uses Web Speech API, falls back gracefully)
  $('mlsVoiceSearchBtn')?.addEventListener('click', function() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice search not supported in this browser.'); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      $('mlsLocationInput').value = text;
    };
    rec.start();
  });
})();
