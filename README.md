# Star Citizen Trade Route Planner

A web-based trade route planner for Star Citizen that uses live data from [UEX Corp](https://uexcorp.space) to help players plan optimal multi-hop trade routes.

## Features

- 🚀 **Live Trade Data**: Fetches real-time commodity prices and locations from UEX Corp API
- 📊 **Route Optimization**: Calculates the most profitable trade routes based on your parameters
- 💰 **Profit Analysis**: Shows detailed profit calculations, ROI, and investment requirements
- 🎯 **Multi-hop Planning**: Support for planning routes with multiple trading stops
- 🔧 **Customizable**: Configure cargo capacity, starting credits, and maximum hops
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Get a UEX Corp API Key**
   - Visit [https://uexcorp.space/api](https://uexcorp.space/api)
   - Register for a free account
   - Create an API application to get your Bearer token

2. **Open the Application**
   - Open `index.html` in your web browser
   - Or host the files on any web server

3. **Configure Your Trade**
   - Enter your UEX Corp API key
   - Click "Load Trade Data" to fetch current market information
   - Select your starting location
   - Set your cargo capacity and starting credits
   - Choose maximum hops for your route

4. **Calculate Routes**
   - Click "Calculate Best Routes"
   - Review the top 10 most profitable trade routes
   - Each route shows detailed buy/sell information for each hop

## How It Works

The application:
1. Fetches all available trading locations from UEX Corp
2. Retrieves commodity data and current prices
3. Analyzes all possible trade routes from your starting location
4. Calculates profit based on your cargo capacity and available credits
5. Ranks routes by total profit and displays the top opportunities

## Files

- `index.html` - Main application interface
- `app.js` - Trade route calculation and API integration logic
- `style.css` - Styling and responsive design
- `README.md` - This documentation

## API Integration

This application uses the [UEX Corp API 2.0](https://uexcorp.space/api/documentation/):

- **Base URL**: `https://api.uexcorp.uk/2.0` (Note: The API uses the .uk domain, while the main site is at uexcorp.space)
- **Endpoints Used**:
  - `/locations` - Get all trading locations
  - `/commodities` - Get all tradeable commodities
  - `/commodities_prices` - Get current buy/sell prices

## Technical Details

- Pure JavaScript (no frameworks required)
- No backend server needed - runs entirely in the browser
- Uses modern ES6+ features
- Responsive CSS Grid and Flexbox layout
- Async/await for API calls

## Rate Limits

UEX Corp API has the following limits:
- 14,400 requests per day
- 10 requests per minute

The application makes 3 API calls to load data, so use responsibly.

## Future Enhancements

Potential features for future versions:
- Multi-hop route optimization (beyond simple buy/sell)
- Distance calculations between locations
- Fuel cost considerations
- Route persistence and favorites
- Real-time price updates
- Filtering by commodity type or location
- Export routes to various formats

## Contributing

This is an open-source project. Feel free to submit issues or pull requests!

## License

MIT License - Feel free to use and modify as needed.

## Disclaimer

This tool uses community-sourced data from UEX Corp. Prices and availability may vary in-game. Always verify prices before making trades in Star Citizen.

## Credits

- Data provided by [UEX Corp](https://uexcorp.space)
- Built for the Star Citizen community
