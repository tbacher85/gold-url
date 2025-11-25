// netlify/functions/create-link.js

// Simple in-memory storage (will reset on server restart)
// In production, replace with a database
let urlMappings = {
    'test': 'https://google.com',
    'demo': 'https://github.com',
    'example': 'https://example.com'
};

exports.handler = async (event) => {
    console.log('Create-link function called');
    
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod === 'POST') {
        try {
            const { longUrl, shortCode } = JSON.parse(event.body);
            
            console.log('Creating link:', shortCode, '->', longUrl);
            
            // Store the mapping
            urlMappings[shortCode] = longUrl;
            
            console.log('Current mappings:', Object.keys(urlMappings));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    shortCode: shortCode,
                    shortUrl: `${process.env.URL || 'https://your-site.netlify.app'}/${shortCode}`,
                    longUrl: longUrl
                })
            };
        } catch (error) {
            console.error('Error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.toString() })
            };
        }
    }

    // Method not allowed
    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
