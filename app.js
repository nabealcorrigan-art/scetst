// Star Citizen Trade Route Planner
// Using UEX Corp API for live trade data

class TradeRoutePlanner {
    constructor() {
        this.apiKey = '';
        this.baseUrl = 'https://api.uexcorp.uk/2.0';
        this.locations = [];
        this.commodities = [];
        this.prices = [];
        this.routes = [];
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('load-data-btn').addEventListener('click', () => this.loadTradeData());
        document.getElementById('calculate-route-btn').addEventListener('click', () => this.calculateRoutes());
        document.getElementById('api-key').addEventListener('input', (e) => {
            this.apiKey = e.target.value.trim();
        });
    }

    showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    async fetchAPI(endpoint) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status === 'error') {
            throw new Error(data.message || 'API returned an error');
        }

        return data.data || data;
    }

    async loadTradeData() {
        if (!this.apiKey) {
            this.showError('Please enter your UEX Corp API key');
            return;
        }

        this.showLoading(true);
        document.getElementById('error').classList.add('hidden');

        try {
            // Load locations first
            console.log('Loading locations...');
            this.locations = await this.fetchAPI('/locations');
            console.log(`Loaded ${this.locations.length} locations`);

            // Populate location dropdown
            this.populateLocationDropdown();

            // Load commodities
            console.log('Loading commodities...');
            this.commodities = await this.fetchAPI('/commodities');
            console.log(`Loaded ${this.commodities.length} commodities`);

            // Load commodity prices
            console.log('Loading commodity prices...');
            this.prices = await this.fetchAPI('/commodities_prices');
            console.log(`Loaded ${this.prices.length} price entries`);

            // Show summary
            this.showDataSummary();

            // Enable calculate button
            document.getElementById('calculate-route-btn').disabled = false;

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading trade data:', error);
            this.showError(`Failed to load trade data: ${error.message}`);
            this.showLoading(false);
        }
    }

    populateLocationDropdown() {
        const select = document.getElementById('starting-location');
        select.innerHTML = '<option value="">Select location...</option>';
        
        // Sort locations alphabetically
        const sortedLocations = [...this.locations].sort((a, b) => {
            const nameA = a.name || a.location_name || '';
            const nameB = b.name || b.location_name || '';
            return nameA.localeCompare(nameB);
        });

        sortedLocations.forEach(location => {
            const option = document.createElement('option');
            const locationName = location.name || location.location_name || 'Unknown';
            option.value = location.id || location.id_location;
            option.textContent = locationName;
            select.appendChild(option);
        });
    }

    showDataSummary() {
        const summaryDiv = document.getElementById('data-summary');
        const contentDiv = document.getElementById('summary-content');
        
        const locationCount = this.locations.length;
        const commodityCount = this.commodities.length;
        const priceCount = this.prices.length;

        contentDiv.innerHTML = `
            <p><strong>Locations:</strong> ${locationCount} trading locations loaded</p>
            <p><strong>Commodities:</strong> ${commodityCount} different commodities available</p>
            <p><strong>Price Data:</strong> ${priceCount} price entries in database</p>
            <p><strong>Status:</strong> Ready to calculate trade routes!</p>
        `;

        summaryDiv.classList.remove('hidden');
    }

    calculateRoutes() {
        const startingLocationId = document.getElementById('starting-location').value;
        const maxHops = parseInt(document.getElementById('max-hops').value);
        const cargoCapacity = parseInt(document.getElementById('cargo-capacity').value);
        const startingCredits = parseInt(document.getElementById('starting-credits').value);

        if (!startingLocationId) {
            this.showError('Please select a starting location');
            return;
        }

        this.showLoading(true);

        try {
            // Calculate best routes
            this.routes = this.findBestRoutes(startingLocationId, maxHops, cargoCapacity, startingCredits);
            
            if (this.routes.length === 0) {
                this.showError('No profitable routes found with current parameters');
                this.showLoading(false);
                return;
            }

            // Display results
            this.displayRoutes();
            this.showLoading(false);
        } catch (error) {
            console.error('Error calculating routes:', error);
            this.showError(`Failed to calculate routes: ${error.message}`);
            this.showLoading(false);
        }
    }

    findBestRoutes(startLocationId, maxHops, cargoCapacity, startingCredits) {
        const routes = [];

        // Create a price lookup map for faster access
        const pricesByLocation = new Map();
        this.prices.forEach(price => {
            const locId = price.id_location || price.location_id;
            if (!pricesByLocation.has(locId)) {
                pricesByLocation.set(locId, []);
            }
            pricesByLocation.get(locId).push(price);
        });

        // Find all possible single-hop routes from starting location
        const startPrices = pricesByLocation.get(parseInt(startLocationId)) || [];

        startPrices.forEach(startPrice => {
            if (!startPrice.price_buy || startPrice.price_buy <= 0) return;

            const commodityId = startPrice.id_commodity || startPrice.commodity_id;
            
            // Find all locations where we can sell this commodity for profit
            this.prices.forEach(sellPrice => {
                if ((sellPrice.id_commodity || sellPrice.commodity_id) !== commodityId) return;
                if ((sellPrice.id_location || sellPrice.location_id) === parseInt(startLocationId)) return;
                if (!sellPrice.price_sell || sellPrice.price_sell <= 0) return;

                const buyPrice = startPrice.price_buy;
                const sellPriceValue = sellPrice.price_sell;
                const profitPerUnit = sellPriceValue - buyPrice;

                if (profitPerUnit > 0) {
                    const affordableUnits = Math.floor(startingCredits / buyPrice);
                    const unitsToTrade = Math.min(affordableUnits, cargoCapacity);
                    const totalProfit = profitPerUnit * unitsToTrade;

                    if (totalProfit > 0 && unitsToTrade > 0) {
                        routes.push({
                            totalProfit,
                            profitPerUnit,
                            hops: [
                                {
                                    hopNumber: 1,
                                    action: 'BUY',
                                    locationId: startLocationId,
                                    locationName: this.getLocationName(startLocationId),
                                    commodityId,
                                    commodityName: this.getCommodityName(commodityId),
                                    price: buyPrice,
                                    units: unitsToTrade,
                                    cost: buyPrice * unitsToTrade
                                },
                                {
                                    hopNumber: 2,
                                    action: 'SELL',
                                    locationId: sellPrice.id_location || sellPrice.location_id,
                                    locationName: this.getLocationName(sellPrice.id_location || sellPrice.location_id),
                                    commodityId,
                                    commodityName: this.getCommodityName(commodityId),
                                    price: sellPriceValue,
                                    units: unitsToTrade,
                                    revenue: sellPriceValue * unitsToTrade
                                }
                            ],
                            investment: buyPrice * unitsToTrade,
                            roi: ((totalProfit / (buyPrice * unitsToTrade)) * 100).toFixed(2)
                        });
                    }
                }
            });
        });

        // Sort by total profit descending
        routes.sort((a, b) => b.totalProfit - a.totalProfit);

        // Return top 10 routes
        return routes.slice(0, 10);
    }

    getLocationName(locationId) {
        const location = this.locations.find(loc => 
            String(loc.id || loc.id_location) === String(locationId)
        );
        return location ? (location.name || location.location_name || 'Unknown') : 'Unknown Location';
    }

    getCommodityName(commodityId) {
        const commodity = this.commodities.find(com => 
            String(com.id || com.id_commodity || com.commodity_id) === String(commodityId)
        );
        return commodity ? (commodity.name || commodity.commodity_name || 'Unknown') : 'Unknown Commodity';
    }

    displayRoutes() {
        const resultsDiv = document.getElementById('results');
        const routesContainer = document.getElementById('routes-container');

        routesContainer.innerHTML = '';

        this.routes.forEach((route, index) => {
            const routeCard = this.createRouteCard(route, index + 1);
            routesContainer.appendChild(routeCard);
        });

        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    createRouteCard(route, routeNumber) {
        const card = document.createElement('div');
        card.className = 'route-card';

        const header = document.createElement('div');
        header.className = 'route-header';
        header.innerHTML = `
            <div class="route-title">Route #${routeNumber}</div>
            <div class="route-profit">+${route.totalProfit.toLocaleString()} aUEC</div>
        `;
        card.appendChild(header);

        const hopsContainer = document.createElement('div');
        hopsContainer.className = 'route-hops';

        route.hops.forEach(hop => {
            const hopDiv = document.createElement('div');
            hopDiv.className = 'hop';

            let hopContent = `
                <div class="hop-number">Hop ${hop.hopNumber}: ${hop.action}</div>
                <div class="hop-details">
                    <div class="hop-detail">
                        <div class="hop-detail-label">Location</div>
                        <div class="hop-detail-value location-name">${hop.locationName}</div>
                    </div>
                    <div class="hop-detail">
                        <div class="hop-detail-label">Commodity</div>
                        <div class="hop-detail-value commodity-name">${hop.commodityName}</div>
                    </div>
                    <div class="hop-detail">
                        <div class="hop-detail-label">Price per Unit</div>
                        <div class="hop-detail-value">${hop.price.toLocaleString()} aUEC</div>
                    </div>
                    <div class="hop-detail">
                        <div class="hop-detail-label">Units</div>
                        <div class="hop-detail-value">${hop.units.toLocaleString()} SCU</div>
                    </div>
            `;

            if (hop.action === 'BUY') {
                hopContent += `
                    <div class="hop-detail">
                        <div class="hop-detail-label">Total Cost</div>
                        <div class="hop-detail-value profit-negative">-${hop.cost.toLocaleString()} aUEC</div>
                    </div>
                `;
            } else {
                hopContent += `
                    <div class="hop-detail">
                        <div class="hop-detail-label">Total Revenue</div>
                        <div class="hop-detail-value profit-positive">+${hop.revenue.toLocaleString()} aUEC</div>
                    </div>
                `;
            }

            hopContent += `</div>`;
            hopDiv.innerHTML = hopContent;
            hopsContainer.appendChild(hopDiv);
        });

        card.appendChild(hopsContainer);

        // Add summary
        const summary = document.createElement('div');
        summary.className = 'route-summary';
        summary.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Investment</div>
                <div class="summary-value">${route.investment.toLocaleString()} aUEC</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value profit-positive">+${route.totalProfit.toLocaleString()} aUEC</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Profit per Unit</div>
                <div class="summary-value">${route.profitPerUnit.toLocaleString()} aUEC</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">ROI</div>
                <div class="summary-value">${route.roi}%</div>
            </div>
        `;
        card.appendChild(summary);

        return card;
    }
}

// Initialize the planner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TradeRoutePlanner();
});
