#!/bin/bash

# Star Citizen Trade Route Planner - Installation Script
# This script helps set up and run the application

set -e

echo "=============================================="
echo "Star Citizen Trade Route Planner - Installer"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "app.js" ]; then
    echo -e "${RED}Error: This script must be run from the project root directory${NC}"
    echo "Expected files: index.html, app.js, style.css"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found application files"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for available web servers
echo "Checking for available web servers..."
WEB_SERVER=""

if command_exists python3; then
    echo -e "${GREEN}✓${NC} Python 3 found (can use built-in HTTP server)"
    WEB_SERVER="python3"
elif command_exists python; then
    # Check Python version - Python 2 is EOL and not recommended
    PYTHON_VERSION=$(python --version 2>&1)
    if echo "$PYTHON_VERSION" | grep -q "Python 3"; then
        echo -e "${GREEN}✓${NC} Python 3 found (can use built-in HTTP server)"
        WEB_SERVER="python"
    else
        echo -e "${YELLOW}!${NC} Python 2 found (EOL, not recommended - please install Python 3)"
    fi
fi

if command_exists node; then
    echo -e "${GREEN}✓${NC} Node.js found (can use http-server if installed)"
    if command_exists npx; then
        WEB_SERVER="node"
    fi
fi

if command_exists php; then
    echo -e "${GREEN}✓${NC} PHP found (can use built-in HTTP server)"
    if [ -z "$WEB_SERVER" ]; then
        WEB_SERVER="php"
    fi
fi

echo ""

# Display installation information
echo -e "${BLUE}Installation Complete!${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Getting Started:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Get your UEX Corp API key:"
echo "   Visit: https://uexcorp.space/api"
echo "   Register and create an API application"
echo ""
echo "2. Run the application:"
echo ""

if [ -n "$WEB_SERVER" ]; then
    echo -e "${GREEN}Option A: Use a local web server (recommended)${NC}"
    echo ""
    if [ "$WEB_SERVER" = "python3" ]; then
        echo "   python3 -m http.server 8000"
    elif [ "$WEB_SERVER" = "python" ]; then
        echo "   python -m http.server 8000"
    elif [ "$WEB_SERVER" = "python2" ]; then
        echo "   python -m SimpleHTTPServer 8000"
    elif [ "$WEB_SERVER" = "node" ]; then
        echo "   npx http-server -p 8000"
    elif [ "$WEB_SERVER" = "php" ]; then
        echo "   php -S localhost:8000"
    fi
    echo ""
    echo "   Then open: http://localhost:8000"
    echo ""
    echo -e "${YELLOW}Option B: Open directly in browser${NC}"
    echo "   Open index.html in your web browser"
    echo "   (Note: Some browsers may restrict API calls from file:// URLs)"
else
    echo -e "${YELLOW}No web server found.${NC}"
    echo "You can:"
    echo "   - Open index.html directly in your browser"
    echo "   - Install Python 3, Node.js, or PHP to use a local server"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Offer to start the server
if [ -n "$WEB_SERVER" ]; then
    echo -n "Would you like to start the web server now? (y/N): "
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo -e "${GREEN}Starting web server on http://localhost:8000${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
        echo ""
        
        # Delay before opening browser to allow server to start
        BROWSER_LAUNCH_DELAY=2
        
        # Try to open the browser
        if command_exists xdg-open; then
            sleep $BROWSER_LAUNCH_DELAY && xdg-open "http://localhost:8000" &
        elif command_exists open; then
            sleep $BROWSER_LAUNCH_DELAY && open "http://localhost:8000" &
        fi
        
        # Start the server
        if [ "$WEB_SERVER" = "python3" ]; then
            python3 -m http.server 8000
        elif [ "$WEB_SERVER" = "python" ]; then
            python -m http.server 8000
        elif [ "$WEB_SERVER" = "python2" ]; then
            python -m SimpleHTTPServer 8000
        elif [ "$WEB_SERVER" = "node" ]; then
            npx http-server -p 8000
        elif [ "$WEB_SERVER" = "php" ]; then
            php -S localhost:8000
        fi
    fi
fi

echo ""
echo -e "${GREEN}Happy trading in the verse!${NC} 🚀"
echo ""
