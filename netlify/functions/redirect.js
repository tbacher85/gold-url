// netlify/functions/redirect.js
const { google } = require('googleapis');

exports.handler = async (event) => {
  const pathParts = event.path.split('/');
  const shortCode = pathParts[pathParts.length - 1];
  
  // Skip favicon and other non-shortcode paths
  if (['favicon.ico', 'index.html', '404.html', '.netlify'].includes(shortCode) || !shortCode) {
    return {
      statusCode: 302,
      headers: {
        'Location': `https://${event.headers.host}`,
        'Cache-Control': 'no-cache'
      }
    };
  }
  
  console.log('Looking for short code:', shortCode);
  
  try {
    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get all mappings from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:C', // Adjust if your sheet name is different
    });

    const rows = response.data.values || [];
    console.log(`Found ${rows.length} rows in sheet`);

    // Skip header row if it exists
    const startIndex = rows[0] && rows[0][0] === 'shortCode' ? 1 : 0;
    
    // Find the target URL by shortCode (column A)
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === shortCode) {
        const targetUrl = row[1];
        console.log('✓ FOUND - Redirecting to:', targetUrl);
        
        return {
          statusCode: 302,
          headers: {
            'Location': targetUrl,
            'Cache-Control': 'no-cache'
          }
        };
      }
    }

    console.log('✗ NOT FOUND - Code not in sheet:', shortCode);

  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
  }
  
  // Not found - redirect to main site
  console.log('Redirecting to main site');
  return {
    statusCode: 302,
    headers: {
      'Location': `https://${event.headers.host}`,
      'Cache-Control': 'no-cache'
    }
  };
};
