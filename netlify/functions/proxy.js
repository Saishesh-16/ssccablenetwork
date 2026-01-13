// Netlify Function to proxy API requests and bypass CORS
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Get the requested path from the query string
    const path = event.queryStringParameters?.path || '';
    const backendUrl = 'https://ssccablenetworkbackend.onrender.com/api';

    console.log('Proxying request:', {
      method: event.httpMethod,
      path: path,
      fullUrl: `${backendUrl}${path}`
    });

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
    
    // Try to parse JSON, but handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    console.log('Backend response:', {
      status: response.status,
      data: data
    });

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Proxy function error. Check backend server status.'
      })
    };
  }
};
