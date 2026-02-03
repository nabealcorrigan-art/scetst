# Star Citizen Trade Route Planner

A web-based trade route planner for Star Citizen that uses live data from [UEX Corp](https://uexcorp.space) to help players plan optimal multi-hop trade routes with advanced metrics and strategic planning features.

## Features

### Core Functionality
- 🚀 **Live Trade Data**: Fetches real-time commodity prices and locations from UEX Corp API
- 📊 **Multi-hop Route Planning**: Chain together multiple trade legs (up to 5 hops) for maximum profitability
- 🔄 **Circular Routes**: Find routes that start and end at the same location for repeatable loops
- 💰 **Advanced Profit Analysis**: Detailed calculations including ROI, profit per hour, and margin per SCU
- 🎯 **Deadhead Leg Support**: Plan repositioning legs with no cargo to access better markets

### Ship Profiles
- 🚢 **Multiple Ship Options**: Pre-configured profiles for popular trading ships
  - Freelancer (66 SCU)
  - Caterpillar (576 SCU)
  - Constellation Andromeda (96 SCU)
  - C2 Hercules (696 SCU)
  - Mercury Star Runner (114 SCU)
  - Hull C (4608 SCU)
  - Cutlass Black (46 SCU)
  - Custom Ship (configurable)
- ⚡ **Speed & Fuel Calculations**: Each ship has unique speed and fuel usage affecting route efficiency
- 🎲 **Risk Profiles**: Ships categorized by risk level (low/medium/high/very-high)

### Route Metrics
- 💵 **Total Profit**: Complete profit calculation for entire route
- ⏱️ **Profit per Hour**: Efficiency metric based on travel time
- 📈 **ROI (Return on Investment)**: Percentage return on invested credits
- 📏 **Distance Tracking**: Total distance traveled across all hops
- ⏰ **Time Estimates**: Travel time calculations for each leg and total route
- 📦 **Cargo Value**: Track value of goods in transit

### Filters & Constraints
- ⚖️ **Legal/Illegal Commodities**: Toggle to include or exclude illegal goods
- 🔁 **Circular Route Filter**: Show only routes that return to start
- 🏆 **Smart Ranking**: Rank routes by:
  - Total Profit (max credits earned)
  - Profit per Hour (efficiency)
  - ROI (best return percentage)
  - Safety (shorter distances, fewer deadheads)

### Route Display
- 🏷️ **Visual Badges**: Circular route and deadhead indicators
- 📊 **Detailed Hop Breakdown**: Each hop shows:
  - Location and commodity information
  - Buy/sell prices and quantities
  - Distance and travel time
  - Profit margins and cargo value
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
   - Select your ship (affects cargo, speed, fuel)
   - Choose your starting location
   - Set maximum hops (1-5)
   - Configure route preferences:
     - Allow illegal commodities (higher risk, higher reward)
     - Circular routes only (for repeatable loops)
   - Select ranking method

4. **Calculate Routes**
   - Click "Calculate Best Routes"
   - Review top 10 routes with complete metrics
   - Each route shows buy/sell information, profit, distance, time, and efficiency

## How It Works

The application provides strategic planning beyond simple buy-low-sell-high:

1. **Multi-hop Optimization**: Instead of single trades, the system chains multiple buy/sell operations together to maximize profit across an entire journey

2. **Circular Route Planning**: Identifies routes that return to the starting point, enabling repeatable profitable loops without wasted repositioning time

3. **Deadhead Management**: Explicitly plans and tracks empty legs needed for repositioning, showing their true cost impact on route efficiency

4. **Profit per Hour**: Calculates efficiency by factoring in travel time and distance, helping you choose between quick profits and longer but potentially more lucrative routes

5. **Ship-Specific Calculations**: Different ships have different characteristics:
   - Larger cargo = more profit per run but higher investment
   - Faster ships = better profit per hour
   - Higher fuel usage = more deadhead costs

6. **Risk vs Reward**: Choose between:
   - Legal commodities (safer, more consistent)
   - Illegal commodities (higher margins, higher risk)
   - Short routes (predictable, lower total profit)
   - Long routes (higher risk, potentially massive profits)

## Files

- `index.html` - Main application interface with advanced configuration options
- `app.js` - Multi-hop route calculation engine and API integration
- `style.css` - Modern responsive design with route visualization
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
- Recursive route building algorithm
- Distance and time estimation algorithms

## Rate Limits

UEX Corp API has the following limits:
- 14,400 requests per day
- 10 requests per minute

The application makes 3 API calls to load data, so use responsibly.

## Advanced Features Explained

### Multi-hop Routes
Multi-hop routes allow you to chain trades together:
- **Hop 1**: Buy commodity A at Location 1, sell at Location 2
- **Hop 2**: Buy commodity B at Location 2, sell at Location 3
- **Hop 3**: Buy commodity C at Location 3, sell at Location 1 (circular)

This approach maximizes cargo utilization and minimizes empty travel.

### Deadhead Legs
A deadhead is a journey with no cargo, typically used for repositioning:
- Clearly labeled with red indicator
- Fuel costs deducted from total profit
- Factored into profit-per-hour calculations
- Useful for accessing high-value markets

### Route Ranking Strategies
- **Total Profit**: Best for maximizing credits per run (longer routes)
- **Profit per Hour**: Best for grinding efficiency (shorter loops)
- **ROI**: Best when working with limited capital
- **Safety**: Best for risk-averse players (shorter, fewer deadheads)

## Future Enhancements

Potential features for future versions:
- System exclusion lists (avoid dangerous areas)
- Armistice zone preferences (safe trading only)
- Actual coordinate-based distance calculations
- Fuel consumption tracking
- Route persistence and favorites
- Real-time price update notifications
- Historical price trends
- Route sharing and export

## Contributing

This is an open-source project. Feel free to submit issues or pull requests!

## License

MIT License - Feel free to use and modify as needed.

## Disclaimer

This tool uses community-sourced data from UEX Corp. Prices and availability may vary in-game. Always verify prices before making trades in Star Citizen.

## Credits

- Data provided by [UEX Corp](https://uexcorp.space)
- Built for the Star Citizen community
- Inspired by the needs of dedicated traders in the verse
