// netlify/functions/redirect.js
exports.handler = async (event) => {
    // Get the short code from the URL path
    const shortCode = event.path.split('/').pop();
    
    console.log('Looking for short code:', shortCode);
    
    // Temporary storage - we'll replace this with a database later
    const redirects = {
        'test': 'https://google.com',
        'demo': 'https://github.com'
        // Add your mappings here
    };
    
    const targetUrl = redirects[shortCode];
    
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
    console.log('Short code not found:', shortCode);
    return {
        statusCode: 302,
        headers: {
            'Location': 'https://your-site.netlify.app', // Replace with your actual Netlify URL
            'Cache-Control': 'no-cache'
        }
    };
};
