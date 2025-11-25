// Serverless function for redirects
exports.handler = async (event) => {
    const shortCode = event.path.substring(1); // Remove leading slash
    
    // You can store mappings in a JSON file or use a simple key-value store
    const redirects = {
        'test': 'https://google.com',
        // Add your mappings here
    };
    
    const targetUrl = redirects[shortCode];
    
    if (targetUrl) {
        return {
            statusCode: 302,
            headers: {
                'Location': targetUrl,
                'Cache-Control': 'no-cache'
            }
        };
    }
    
    // Not found - redirect to main site
    return {
        statusCode: 302,
        headers: {
            'Location': 'https://your-domain.netlify.app',
            'Cache-Control': 'no-cache'
        }
    };
};
