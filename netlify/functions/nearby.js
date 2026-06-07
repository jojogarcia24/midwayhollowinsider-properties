// Elite Living Realty — Nearby Places proxy
// Calls Google Places API (New) server-side so it works on any domain
// (no browser HTTP-referrer restriction). Returns named places per category.
//
// Requires a Netlify env var with a Google key that has the
// "Places API (New)" enabled. Looked up in this order:
//   GOOGLE_MAPS_KEY  ->  GOOGLE_PLACES_KEY  ->  GOOGLE_API_KEY  ->  GOOGLE_KEY
// The key should NOT be HTTP-referrer restricted (server requests send no
// Referer). Restricting it to the Places API only is fine.

const KEY =
  process.env.GOOGLE_MAPS_KEY ||
  process.env.GOOGLE_PLACES_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_KEY ||
  '';

const CATEGORIES = [
  ['restaurant', ['restaurant']],
  ['supermarket', ['supermarket', 'grocery_store']],
  ['park', ['park']],
  ['school', ['school', 'primary_school', 'secondary_school']]
];

async function searchOne(includedTypes, lat, lng) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress,places.formattedAddress'
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: 6,
      rankPreference: 'POPULARITY',
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 4000 }
      }
    })
  });
  const json = await res.json().catch(() => ({}));
  const places = Array.isArray(json.places) ? json.places : [];
  return places
    .map(p => ({
      name: (p.displayName && p.displayName.text) || '',
      address: p.shortFormattedAddress || p.formattedAddress || ''
    }))
    .filter(p => p.name);
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=86400'
  };

  try {
    const q = event.queryStringParameters || {};
    const lat = parseFloat(q.lat);
    const lng = parseFloat(q.lng);

    if (!KEY) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: 'missing_key', results: {} }) };
    }
    if (!isFinite(lat) || !isFinite(lng)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'bad_coords', results: {} }) };
    }

    const results = {};
    await Promise.all(
      CATEGORIES.map(async ([key, includedTypes]) => {
        try {
          results[key] = await searchOne(includedTypes, lat, lng);
        } catch (e) {
          results[key] = [];
        }
      })
    );

    return { statusCode: 200, headers, body: JSON.stringify({ results }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: String(e), results: {} }) };
  }
};
