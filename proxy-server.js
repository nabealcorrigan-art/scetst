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

// Serve static files (index.html, app.js, style.css)
app.use(express.static(__dirname));

// Proxy endpoint for UEX Corp API
app.get('/api/*', async (req, res) => {
    // Extract the path after /api/
    const apiPath = req.path.replace('/api', '');
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
        
        // Get the response data
        const data = await response.json();
        
        // Send the response back to the client with the same status code
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Proxy server error: ' + error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Star Citizen Trade Route Planner - Proxy Server          ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on: http://localhost:${PORT}
✓ Open your browser to: http://localhost:${PORT}
✓ API requests will be proxied through this server to avoid CORS issues

Press Ctrl+C to stop the server
`);
});
