// Simple in-memory storage (reset on server restart)
// We'll replace this with a database later
let urlMappings = {
    'test': 'https://google.com',
    'demo': 'https://github.com'
};

exports.handler = async (event) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    shortCode: shortCode,
                    shortUrl: `https://your-site.netlify.app/${shortCode}`,
                    longUrl: longUrl
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.toString() })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
