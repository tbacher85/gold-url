// netlify/functions/redirect.js
exports.handler = async (event) => {
  const pathParts = event.path.split('/');
  const shortCode = pathParts[pathParts.length - 1];
  
  // Skip favicon and other non-shortcode paths
  if (['favicon.ico', 'index.html', '404.html'].includes(shortCode)) {
    return {
      statusCode: 302,
      headers: {
        'Location': 'https://gold-url.netlify.app',
        'Cache-Control': 'no-cache'
      }
    };
  }
  
  console.log('Looking for short code:', shortCode);
  
  try {
    // Get mappings from JSONBin
    const response = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}/latest`, {
      headers: { 
        'X-Master-Key': process.env.JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`JSONBin API error: ${response.status}`);
    }
    
    const data = await response.json();
    const mappings = data.record.mappings || {};
    
    console.log('Available mappings:', Object.keys(mappings));
    
    const targetUrl = mappings[shortCode];
    
    if (targetUrl) {
      console.log('✓ FOUND - Redirecting to:', targetUrl);
      return {
        statusCode: 302,
        headers: {
          'Location': targetUrl,
          'Cache-Control': 'no-cache'
        }
      };
    } else {
      console.log('✗ NOT FOUND - Code not in mappings');
    }
  } catch (error) {
    console.error('Error fetching from JSONBin:', error);
  }
  
  // Not found - redirect to main site
  console.log('Redirecting to main site');
  return {
    statusCode: 302,
    headers: {
      'Location': 'https://gold-url.netlify.app',
      'Cache-Control': 'no-cache'
    }
  };
};
