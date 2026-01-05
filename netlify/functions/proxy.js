// Netlify Function to proxy API requests and bypass CORS
exports.handler = async (event) => {
  try {
    // Get the requested path from the query string
    const path = event.queryStringParameters?.path || '';
    const backendUrl = 'https://ssccablenetworkbackend.onrender.com/api';

    const options = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Include body for POST/PUT requests
    if (event.body && (event.httpMethod === 'POST' || event.httpMethod === 'PUT')) {
      options.body = event.body;
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}${path}`, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
