// netlify/functions/redirect.js
const fs = require('fs');
const path = require('path');

// Path to our storage file - MUST BE EXACTLY THE SAME as create-link.js
const STORAGE_FILE = path.join('/tmp', 'url-mappings.json');

// Helper function to read from storage - MUST BE EXACTLY THE SAME as create-link.js
function readMappings() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('Error reading storage:', error);
    }
    
    // Return default mappings if file doesn't exist
    return {
        'test': 'https://google.com',
        'demo': 'https://github.com',
        'example': 'https://example.com'
    };
}

exports.handler = async (event) => {
    console.log('=== REDIRECT FUNCTION STARTED ===');
    console.log('Full path:', event.path);
    
    // Extract the short code from the URL path
    const pathParts = event.path.split('/');
    const shortCode = pathParts[pathParts.length - 1];
    
    console.log('Looking for short code:', shortCode);
    
    // Read mappings from shared storage
    const mappings = readMappings();
    
    console.log('Total mappings in storage:', Object.keys(mappings).length);
    console.log('All available codes:', Object.keys(mappings));
    
    const targetUrl = mappings[shortCode];
    
    if (targetUrl) {
        console.log('✓ FOUND - Redirecting', shortCode, 'to:', targetUrl);
        return {
            statusCode: 302,
            headers: {
                'Location': targetUrl,
                'Cache-Control': 'no-cache'
            }
        };
    }
    
    // Not found
    console.log('✗ NOT FOUND - Code', shortCode, 'not in storage. Redirecting to main site.');
    console.log('Available codes are:', Object.keys(mappings));
    
    return {
        statusCode: 302,
        headers: {
            'Location': 'https://gold-url.netlify.app',
            'Cache-Control': 'no-cache'
        }
    };
};
