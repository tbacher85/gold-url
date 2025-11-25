// netlify/functions/redirect.js

// This would ideally be a database - using in-memory for now
let urlMappings = {
    'test': 'https://google.com',
    'demo': 'https://github.com'
};

exports.handler = async (event) => {
    const shortCode = event.path.split('/').pop();
    
    console.log('Looking for short code:', shortCode);
    console.log('Available mappings:', Object.keys(urlMappings));
    
    const targetUrl = urlMappings[shortCode];
    
    if (targetUrl) {
        console.log('Redirecting to:', targetUrl);
        return {
            statusCode: 302,
            headers: {
                'Location': targetUrl,
                'Cache-Control': 'no-cache'
            }
        };
    }
    
    // Not found
    console.log('Short code not found:', shortCode);
    return {
        statusCode: 302,
        headers: {
            'Location': 'https://your-site.netlify.app',
            'Cache-Control': 'no-cache'
        }
    };
};
