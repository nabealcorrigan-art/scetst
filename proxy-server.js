// Simple CORS proxy server for UEX Corp API
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const UEX_API_BASE = 'https://api.uexcorp.uk/2.0';

// Enable CORS for all origins
app.use(cors());

// Mock data for fallback when external API is unavailable
const mockData = {
    locations: {
        data: [
            { id: 1, name: 'Port Olisar', system: 'Stanton', planet: 'Crusader' },
            { id: 2, name: 'Lorville', system: 'Stanton', planet: 'Hurston' },
            { id: 3, name: 'Area18', system: 'Stanton', planet: 'ArcCorp' },
            { id: 4, name: 'New Babbage', system: 'Stanton', planet: 'microTech' }
        ]
    },
    commodities: {
        data: [
            { id: 1, name: 'Agricultural Supplies', legal: true },
            { id: 2, name: 'Alcohol', legal: true },
            { id: 3, name: 'Medical Supplies', legal: true }
        ]
    },
    commodities_prices: {
        data: []
    }
};

// Proxy endpoint for UEX Corp API - supports all HTTP methods
// This MUST come before static file serving to ensure API routes take precedence
// Using explicit wildcard pattern to match any path after /api/
app.all('/api/:path(*)', async (req, res) => {
    // Extract the path after /api/ - params.path contains everything after /api/ (without leading slash)
    const apiPath = req.params.path ? `/${req.params.path}` : '/';
    const targetUrl = `${UEX_API_BASE}${apiPath}`;
    
    console.log(`Proxying request: ${targetUrl}`);
    
    try {
        // Get the Authorization header from the incoming request
        const authHeader = req.headers['authorization'];
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Forward the Authorization header if present
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        
        // Make the request to UEX Corp API
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers
        });
        
        // Get the response data - handle both JSON and non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        try {
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { data: text };
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            data = { status: 'error', message: 'Failed to parse API response: ' + parseError.message };
        }
        
        // Send the response back to the client with the same status code
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        
        // Check if we have mock data for this endpoint when external API is unavailable
        const endpointName = apiPath.replace(/^\//, ''); // Remove leading slash
        if (mockData[endpointName]) {
            console.log(`External API unavailable, using mock data for: ${endpointName}`);
            res.setHeader('X-Data-Source', 'mock');
            res.status(200).json(mockData[endpointName]);
        } else {
            res.status(502).json({
                status: 'error',
                message: 'External API is currently unavailable. Please try again later.',
                details: error.message
            });
        }
    }
});

// Serve static files (index.html, app.js, style.css)
// This comes AFTER API routes so /api/* routes take precedence
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Star Citizen Trade Route Planner - Proxy Server          ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on port: ${PORT}
✓ Local access: http://localhost:${PORT}
✓ Network access: http://<your-ip>:${PORT}
✓ API requests will be proxied through this server to avoid CORS issues

Press Ctrl+C to stop the server
`);
});
