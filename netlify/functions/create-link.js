// netlify/functions/create-link.js
const { google } = require('googleapis');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { longUrl, shortCode } = JSON.parse(event.body);
      
      console.log('Creating link:', shortCode, '->', longUrl);
      
      // Validate input
      if (!longUrl || !shortCode) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing longUrl or shortCode' })
        };
      }

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

      // Append the new link as a new row
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:C', // Adjust if your sheet name is different
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [[shortCode, longUrl, new Date().toISOString()]]
        }
      });

      console.log('Successfully saved to Google Sheet:', response.data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          shortCode: shortCode,
          shortUrl: `https://${event.headers.host}/${shortCode}`,
          longUrl: longUrl
        })
      };

    } catch (error) {
      console.error('Error creating link:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to create link',
          details: error.message 
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
