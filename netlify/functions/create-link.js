// netlify/functions/create-link.js
const fs = require('fs');
const path = require('path');

// Path to our storage file
const STORAGE_FILE = path.join('/tmp', 'url-mappings.json');

// Helper function to read from storage
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

// Helper function to write to storage
function writeMappings(mappings) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(mappings, null, 2));
        return true;
    } catch (error) {
        console.log('Error writing storage:', error);
        return false;
    }
}

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
            
            // Read current mappings
            const mappings = readMappings();
            
            // Add new mapping
            mappings[shortCode] = longUrl;
            
            // Save back to storage
            const saved = writeMappings(mappings);
            
            if (saved) {
                console.log('Successfully saved. Current mappings:', Object.keys(mappings));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        shortCode: shortCode,
                        shortUrl: `https://gold-url.netlify.app/${shortCode}`,
                        longUrl: longUrl,
                        totalLinks: Object.keys(mappings).length
                    })
                };
            } else {
                throw new Error('Failed to save mapping');
            }
        } catch (error) {
            console.error('Error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.toString() })
            };
        }
    }

    // GET request - return current mappings for debugging
    if (event.httpMethod === 'GET') {
        const mappings = readMappings();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                mappings: mappings,
                count: Object.keys(mappings).length,
                storageFile: STORAGE_FILE
            })
        };
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
