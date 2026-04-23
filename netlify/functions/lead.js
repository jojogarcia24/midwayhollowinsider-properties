exports.handler = async (event) => {
  const headers = {
    'content-type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const webhookUrl = process.env.GHL_WEBHOOK_URL || process.env.HIGHLEVEL_WEBHOOK_URL || '';
  if (!webhookUrl) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing GHL webhook configuration' })
    };
  }

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const responseText = await response.text();
    if (!response.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'Webhook forward failed',
          status: response.status,
          response: responseText
        })
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        status: response.status,
        response: responseText
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: 'Webhook request error',
        message: error && error.message ? error.message : 'Unknown error'
      })
    };
  }
};
