// netlify/functions/redirect.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

exports.handler = async (event) => {
  const pathParts = event.path.split('/');
  const shortCode = pathParts[pathParts.length - 1];
  
  try {
    await client.connect();
    const database = client.db('url_shortener');
    const collection = database.collection('url_mappings');
    
    // Find the URL and update click count in one operation
    const result = await collection.findOneAndUpdate(
      { shortCode: shortCode },
      { $inc: { clicks: 1 } },
      { returnDocument: 'after' }
    );

    if (result.value && result.value.longUrl) {
      return {
        statusCode: 302,
        headers: {
          'Location': result.value.longUrl,
          'Cache-Control': 'no-cache'
        }
      };
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
  
  // Not found - redirect to main site
  return {
    statusCode: 302,
    headers: {
      'Location': 'https://gold-url.netlify.app',
      'Cache-Control': 'no-cache'
    }
  };
};
