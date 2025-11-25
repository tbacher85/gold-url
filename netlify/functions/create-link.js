// netlify/functions/create-link.js
const { MongoClient } = require('mongodb');

// Connection URI from MongoDB Atlas dashboard
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event) => {
  // Handle CORS
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
      
      await client.connect();
      const database = client.db('url_shortener');
      const collection = database.collection('url_mappings');
      
      // Insert the new URL mapping
      const result = await collection.insertOne({
        shortCode: shortCode,
        longUrl: longUrl,
        clicks: 0,
        createdAt: new Date()
      });

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
    } finally {
      await client.close();
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
