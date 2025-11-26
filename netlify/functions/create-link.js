// netlify/functions/create-link.js
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { longUrl, shortCode } = JSON.parse(event.body);
      
      console.log('Creating link:', shortCode, '->', longUrl);
      
      // Get current mappings from JSONBin
      const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}/latest`, {
        headers: { 
          'X-Master-Key': process.env.JSONBIN_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getResponse.ok) {
        throw new Error(`Failed to fetch mappings: ${getResponse.status}`);
      }
      
      const data = await getResponse.json();
      const mappings = data.record.mappings || {};
      
      console.log('Current mappings count:', Object.keys(mappings).length);
      
      // Add new mapping
      mappings[shortCode] = longUrl;
      
      // Update JSONBin
      const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': process.env.JSONBIN_API_KEY
        },
        body: JSON.stringify({ mappings })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update mappings: ${updateResponse.status}`);
      }
      
      console.log('Successfully saved to JSONBin');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          shortCode: shortCode,
          shortUrl: `https://gold-url.netlify.app/${shortCode}`,
          longUrl: longUrl
        })
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
