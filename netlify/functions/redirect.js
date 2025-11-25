// netlify/functions/redirect.js
exports.handler = async (event) => {
    console.log('Redirect function called with path:', event.path);
    
    // Extract the short code from the URL path
    // Example: /abc123 → abc123
    const pathParts = event.path.split('/');
    const shortCode = pathParts[pathParts.length - 1];
    
    console.log('Extracted short code:', shortCode);
    
    // Temporary storage - we'll replace this with a database later
    // Add your test mappings here
    const urlMappings = {
        'test': 'https://google.com',
        'demo': 'https://github.com',
        'example': 'https://example.com'
        // Add more test mappings as needed
    };
    
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
    
    // Not found - redirect to main site
    console.log('Short code not found, redirecting to main site');
    return {
        statusCode: 302,
        headers: {
            'Location': process.env.URL || 'https://your-site.netlify.app',
            'Cache-Control': 'no-cache'
        }
    };
};
