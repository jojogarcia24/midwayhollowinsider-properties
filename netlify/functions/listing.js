exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const params = event.queryStringParameters || {};
  const listingId = String(params.listingId || params.ListingId || params.mlsId || '').trim();
  const vendor = String(params.vendor || params.mls || '').trim();

  if (!listingId) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Missing listingId' })
    };
  }

  const key = process.env.SIMPLYRETS_KEY || process.env.SIMPLYRETS_USERNAME || '';
  const secret = process.env.SIMPLYRETS_SECRET || process.env.SIMPLYRETS_PASSWORD || '';
  if (!key || !secret) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Server not configured with SimplyRETS credentials' })
    };
  }

  const normalizeId = value => String(value ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const baseUrl = 'https://api.simplyrets.com/properties';
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const queryVariants = [
    { q: listingId, vendor: vendor || undefined, limit: '200' },
    { q: listingId, mls: vendor || undefined, limit: '200' },
    { q: listingId, limit: '200' }
  ];

  const candidates = [];
  for (const variant of queryVariants) {
    const req = new URL(baseUrl);
    Object.entries(variant).forEach(([k, v]) => {
      if (v != null && v !== '') req.searchParams.set(k, v);
    });
    try {
      const response = await fetch(req.toString(), {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${auth}`
        }
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.results) ? payload.results : []);
      if (!rows.length) continue;
      candidates.push(...rows);
      const exact = rows.find(row => [row?.listingId, row?.mlsId].some(id => normalizeId(id) === normalizeId(listingId)));
      if (exact) {
        return {
          statusCode: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(exact)
        };
      }
    } catch {}
  }

  const fallback = candidates.find(row => [row?.listingId, row?.mlsId].some(id => normalizeId(id) === normalizeId(listingId)));
  if (!fallback) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Listing not found' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(fallback)
  };
};
