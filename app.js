// Star Citizen Trade Route Planner
// Using UEX Corp API for live trade data

class TradeRoutePlanner {
    constructor() {
        this.apiKey = '';
        // Use local proxy server to avoid CORS issues
        // When running locally with proxy-server.js, API requests go through /api
        // If you want to access directly, change this back to 'https://api.uexcorp.uk/2.0'
        this.baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168')
            ? '/api'  // Use local proxy when running on localhost or local network
            : '/api'; // Use proxy for all requests to avoid CORS
        this.locations = [];
        this.commodities = [];
        this.prices = [];
        this.routes = [];
        
        // Constants for calculations
        this.DEFAULT_SHIP_SPEED = 150; // Average ship speed in m/s when not using specific ship profile
        this.FUEL_COST_PER_UNIT = 100; // Cost per fuel unit in aUEC
        this.DEADHEAD_SAFETY_PENALTY = 1000; // Multiplier for deadhead legs in safety scoring
        
        // Ship profiles with cargo capacity, speed, and fuel usage
        this.ships = [
            { id: 'freelancer', name: 'Freelancer', cargo: 66, speed: 170, fuelUsage: 1.0, risk: 'medium' },
            { id: 'caterpillar', name: 'Caterpillar', cargo: 576, speed: 130, fuelUsage: 1.8, risk: 'high' },
            { id: 'constellation', name: 'Constellation Andromeda', cargo: 96, speed: 180, fuelUsage: 1.2, risk: 'medium' },
            { id: 'c2', name: 'C2 Hercules', cargo: 696, speed: 140, fuelUsage: 2.0, risk: 'high' },
            { id: 'msr', name: 'Mercury Star Runner', cargo: 114, speed: 200, fuelUsage: 1.1, risk: 'low' },
            { id: 'hull-c', name: 'Hull C', cargo: 4608, speed: 100, fuelUsage: 3.5, risk: 'very-high' },
            { id: 'cutlass', name: 'Cutlass Black', cargo: 46, speed: 160, fuelUsage: 0.8, risk: 'medium' },
            { id: 'custom', name: 'Custom Ship', cargo: 100, speed: 150, fuelUsage: 1.0, risk: 'medium' }
        ];
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('load-data-btn').addEventListener('click', () => this.loadTradeData());
        document.getElementById('calculate-route-btn').addEventListener('click', () => this.calculateRoutes());
        document.getElementById('api-key').addEventListener('input', (e) => {
            this.apiKey = e.target.value.trim();
        });
        
        // Populate ship dropdown
        this.populateShipDropdown();
        
        // Handle ship selection
        document.getElementById('ship-select').addEventListener('change', (e) => {
            const shipId = e.target.value;
            const ship = this.ships.find(s => s.id === shipId);
            if (ship && shipId !== 'custom') {
                document.getElementById('cargo-capacity').value = ship.cargo;
            }
        });
    }
    
    populateShipDropdown() {
        const select = document.getElementById('ship-select');
        select.innerHTML = '';
        
        this.ships.forEach(ship => {
            const option = document.createElement('option');
            option.value = ship.id;
            option.textContent = `${ship.name} (${ship.cargo} SCU)`;
            select.appendChild(option);
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
        const shipId = document.getElementById('ship-select').value;
        const allowIllegal = document.getElementById('allow-illegal').checked;
        const circularOnly = document.getElementById('circular-only').checked;
        const rankBy = document.getElementById('rank-by').value;

        if (!startingLocationId) {
            this.showError('Please select a starting location');
            return;
        }

        this.showLoading(true);

        try {
            const ship = this.ships.find(s => s.id === shipId);
            
            // Calculate best routes based on selected parameters
            if (maxHops === 1) {
                this.routes = this.findBestRoutes(startingLocationId, cargoCapacity, startingCredits, allowIllegal);
            } else {
                this.routes = this.findMultiHopRoutes(
                    startingLocationId, 
                    maxHops, 
                    cargoCapacity, 
                    startingCredits,
                    ship,
                    allowIllegal,
                    circularOnly
                );
            }
            
            // Rank routes based on selected criteria
            this.rankRoutes(rankBy);
            
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

    findBestRoutes(startLocationId, cargoCapacity, startingCredits, allowIllegal) {
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
            const commodity = this.getCommodity(commodityId);
            
            // Filter illegal commodities if not allowed
            if (!allowIllegal && commodity && commodity.is_illegal) return;
            
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
                        const sellLocationId = sellPrice.id_location || sellPrice.location_id;
                        const distance = this.calculateDistance(startLocationId, sellLocationId);
                        const travelTime = this.calculateTravelTime(distance, this.DEFAULT_SHIP_SPEED);
                        
                        routes.push({
                            totalProfit,
                            profitPerUnit,
                            totalDistance: distance,
                            totalTime: travelTime,
                            profitPerHour: travelTime > 0 ? (totalProfit / (travelTime / 60)) : 0,
                            isCircular: false,
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
                                    cost: buyPrice * unitsToTrade,
                                    cargoValue: buyPrice * unitsToTrade,
                                    isDeadhead: false
                                },
                                {
                                    hopNumber: 2,
                                    action: 'SELL',
                                    locationId: sellLocationId,
                                    locationName: this.getLocationName(sellLocationId),
                                    commodityId,
                                    commodityName: this.getCommodityName(commodityId),
                                    price: sellPriceValue,
                                    units: unitsToTrade,
                                    revenue: sellPriceValue * unitsToTrade,
                                    profit: totalProfit,
                                    margin: ((profitPerUnit / buyPrice) * 100).toFixed(2),
                                    distance: distance,
                                    travelTime: travelTime,
                                    isDeadhead: false
                                }
                            ],
                            investment: buyPrice * unitsToTrade,
                            roi: ((totalProfit / (buyPrice * unitsToTrade)) * 100).toFixed(2)
                        });
                    }
                }
            });
        });

        // Sort by total profit descending (default)
        routes.sort((a, b) => b.totalProfit - a.totalProfit);

        // Return top 10 routes
        return routes.slice(0, 10);
    }
    
    findMultiHopRoutes(startLocationId, maxHops, cargoCapacity, startingCredits, ship, allowIllegal, circularOnly) {
        const routes = [];
        const pricesByLocation = this.buildPriceMap();
        
        // Build route recursively
        const buildRoute = (currentLocationId, currentHops, currentCredits, routePath, visitedLocations) => {
            if (currentHops.length >= maxHops) {
                // Check if this is a complete route
                if (currentHops.length > 0 && (!circularOnly || currentLocationId === parseInt(startLocationId))) {
                    const route = this.evaluateRoute(routePath, startLocationId, ship, circularOnly);
                    if (route && route.totalProfit > 0) {
                        routes.push(route);
                    }
                }
                return;
            }
            
            // Find all profitable trades from current location
            const currentPrices = pricesByLocation.get(parseInt(currentLocationId)) || [];
            
            currentPrices.forEach(buyPrice => {
                if (!buyPrice.price_buy || buyPrice.price_buy <= 0) return;
                
                const commodityId = buyPrice.id_commodity || buyPrice.commodity_id;
                const commodity = this.getCommodity(commodityId);
                
                // Filter illegal commodities
                if (!allowIllegal && commodity && commodity.is_illegal) return;
                
                // Find sell opportunities for this commodity
                this.prices.forEach(sellPrice => {
                    if ((sellPrice.id_commodity || sellPrice.commodity_id) !== commodityId) return;
                    
                    const sellLocationId = sellPrice.id_location || sellPrice.location_id;
                    if (sellLocationId === parseInt(currentLocationId)) return;
                    
                    // Avoid revisiting locations during route building, except for the final hop back to start
                    // Allow revisits only when we're on the last possible hop (to enable circular routes)
                    if (visitedLocations.includes(sellLocationId) && routePath.length < maxHops * 2 - 2) return;
                    
                    if (!sellPrice.price_sell || sellPrice.price_sell <= 0) return;
                    
                    const profitPerUnit = sellPrice.price_sell - buyPrice.price_buy;
                    if (profitPerUnit <= 0) return;
                    
                    const affordableUnits = Math.floor(currentCredits / buyPrice.price_buy);
                    const unitsToTrade = Math.min(affordableUnits, cargoCapacity);
                    
                    if (unitsToTrade <= 0) return;
                    
                    const tradeProfit = profitPerUnit * unitsToTrade;
                    const newCredits = currentCredits + tradeProfit;
                    
                    // Create hop pair (buy + sell)
                    const buyHop = {
                        action: 'BUY',
                        locationId: currentLocationId,
                        locationName: this.getLocationName(currentLocationId),
                        commodityId,
                        commodityName: this.getCommodityName(commodityId),
                        price: buyPrice.price_buy,
                        units: unitsToTrade,
                        cost: buyPrice.price_buy * unitsToTrade,
                        isDeadhead: false
                    };
                    
                    const distance = this.calculateDistance(currentLocationId, sellLocationId);
                    const travelTime = this.calculateTravelTime(distance, ship.speed);
                    
                    const sellHop = {
                        action: 'SELL',
                        locationId: sellLocationId,
                        locationName: this.getLocationName(sellLocationId),
                        commodityId,
                        commodityName: this.getCommodityName(commodityId),
                        price: sellPrice.price_sell,
                        units: unitsToTrade,
                        revenue: sellPrice.price_sell * unitsToTrade,
                        profit: tradeProfit,
                        distance: distance,
                        travelTime: travelTime,
                        isDeadhead: false
                    };
                    
                    const newPath = [...routePath, buyHop, sellHop];
                    const newVisited = [...visitedLocations, sellLocationId];
                    
                    // Recurse to find next hop
                    buildRoute(
                        sellLocationId,
                        [...currentHops, { buy: buyHop, sell: sellHop }],
                        newCredits,
                        newPath,
                        newVisited
                    );
                });
            });
            
            // Option: Add deadhead leg to return to start or explore new location
            if (currentHops.length > 0 && currentHops.length < maxHops) {
                // Consider deadhead back to start for circular routes
                if (circularOnly && currentLocationId !== parseInt(startLocationId)) {
                    const distance = this.calculateDistance(currentLocationId, startLocationId);
                    const travelTime = this.calculateTravelTime(distance, ship.speed);
                    const fuelCost = this.calculateFuelCost(distance, ship.fuelUsage);
                    
                    const deadheadHop = {
                        action: 'DEADHEAD',
                        locationId: currentLocationId,
                        locationName: this.getLocationName(currentLocationId),
                        destinationId: startLocationId,
                        destinationName: this.getLocationName(startLocationId),
                        distance: distance,
                        travelTime: travelTime,
                        cost: fuelCost,
                        isDeadhead: true
                    };
                    
                    const newPath = [...routePath, deadheadHop];
                    const route = this.evaluateRoute(newPath, startLocationId, ship, true);
                    if (route && route.totalProfit > 0) {
                        routes.push(route);
                    }
                }
            }
        };
        
        // Start building routes
        buildRoute(startLocationId, [], startingCredits, [], [parseInt(startLocationId)]);
        
        // Sort and return top routes
        routes.sort((a, b) => b.totalProfit - a.totalProfit);
        return routes.slice(0, 10);
    }
    
    evaluateRoute(hopPath, startLocationId, ship, isCircular) {
        if (hopPath.length === 0) return null;
        
        let totalProfit = 0;
        let totalDistance = 0;
        let totalTime = 0;
        let investment = 0;
        let numDeadheads = 0;
        
        const processedHops = hopPath.map((hop, index) => {
            const processedHop = { ...hop, hopNumber: index + 1 };
            
            if (hop.action === 'BUY') {
                investment += hop.cost;
            } else if (hop.action === 'SELL') {
                totalProfit += hop.profit;
                totalDistance += hop.distance || 0;
                totalTime += hop.travelTime || 0;
            } else if (hop.action === 'DEADHEAD') {
                numDeadheads++;
                totalDistance += hop.distance || 0;
                totalTime += hop.travelTime || 0;
                totalProfit -= hop.cost || 0; // Subtract fuel cost
            }
            
            return processedHop;
        });
        
        const lastHop = hopPath[hopPath.length - 1];
        const endLocationId = lastHop.locationId || lastHop.destinationId;
        const isActuallyCircular = String(endLocationId) === String(startLocationId);
        
        return {
            totalProfit,
            totalDistance,
            totalTime,
            profitPerHour: totalTime > 0 ? (totalProfit / (totalTime / 60)) : 0,
            investment,
            roi: investment > 0 ? ((totalProfit / investment) * 100).toFixed(2) : 0,
            isCircular: isActuallyCircular,
            numDeadheads,
            hops: processedHops
        };
    }
    
    buildPriceMap() {
        const pricesByLocation = new Map();
        this.prices.forEach(price => {
            const locId = price.id_location || price.location_id;
            if (!pricesByLocation.has(locId)) {
                pricesByLocation.set(locId, []);
            }
            pricesByLocation.get(locId).push(price);
        });
        return pricesByLocation;
    }
    
    calculateDistance(locationId1, locationId2) {
        // PLACEHOLDER: Simple distance estimation based on location IDs
        // Production implementation should use actual coordinates from the API
        // and calculate real distances between locations
        const id1 = parseInt(locationId1);
        const id2 = parseInt(locationId2);
        const diff = Math.abs(id1 - id2);
        return Math.min(50 + (diff * 10), 500); // Distance in million km (placeholder values)
    }
    
    calculateTravelTime(distance, speed) {
        // Calculate travel time in minutes
        // Parameters:
        //   distance: Distance in million km
        //   speed: Ship speed in m/s
        // Conversion: distance (million km) * 1,000,000 (km to million meters) * 1000 (to meters)
        //            divided by speed (m/s) to get seconds, then divided by 60 for minutes
        const DECIMAL_PLACES = 1;
        const distanceInMeters = distance * 1000000 * 1000; // million km to meters
        const timeInSeconds = distanceInMeters / speed;
        const timeInMinutes = timeInSeconds / 60;
        return Math.round(timeInMinutes * Math.pow(10, DECIMAL_PLACES)) / Math.pow(10, DECIMAL_PLACES);
    }
    
    calculateFuelCost(distance, fuelUsage) {
        // Calculate fuel cost based on distance and ship fuel usage
        // Parameters:
        //   distance: Distance in million km
        //   fuelUsage: Ship-specific fuel consumption multiplier
        // Formula: Divide distance by 100 as a scaling factor for game balance,
        //          multiply by ship's fuel usage rate, then by cost per unit
        const fuelUnits = (distance / 100) * fuelUsage;
        return Math.round(fuelUnits * this.FUEL_COST_PER_UNIT);
    }
    
    rankRoutes(rankBy) {
        switch (rankBy) {
            case 'profit':
                this.routes.sort((a, b) => b.totalProfit - a.totalProfit);
                break;
            case 'profit-per-hour':
                this.routes.sort((a, b) => b.profitPerHour - a.profitPerHour);
                break;
            case 'roi':
                this.routes.sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
                break;
            case 'safety':
                // Rank by fewer deadheads and shorter distances
                // Lower safety score = safer route
                this.routes.sort((a, b) => {
                    const safetyScoreA = (a.numDeadheads || 0) * this.DEADHEAD_SAFETY_PENALTY + a.totalDistance;
                    const safetyScoreB = (b.numDeadheads || 0) * this.DEADHEAD_SAFETY_PENALTY + b.totalDistance;
                    return safetyScoreA - safetyScoreB;
                });
                break;
            default:
                this.routes.sort((a, b) => b.totalProfit - a.totalProfit);
        }
    }
    
    getCommodity(commodityId) {
        return this.commodities.find(com => 
            String(com.id || com.id_commodity || com.commodity_id) === String(commodityId)
        );
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
        
        let circularBadge = '';
        if (route.isCircular) {
            circularBadge = '<span class="route-badge circular">Circular Route</span>';
        }
        
        let deadheadBadge = '';
        if (route.numDeadheads > 0) {
            deadheadBadge = `<span class="route-badge deadhead">${route.numDeadheads} Deadhead Leg${route.numDeadheads > 1 ? 's' : ''}</span>`;
        }
        
        header.innerHTML = `
            <div>
                <div class="route-title">Route #${routeNumber}</div>
                <div class="route-badges">${circularBadge}${deadheadBadge}</div>
            </div>
            <div class="route-profit">+${route.totalProfit.toLocaleString()} aUEC</div>
        `;
        card.appendChild(header);

        const hopsContainer = document.createElement('div');
        hopsContainer.className = 'route-hops';

        route.hops.forEach(hop => {
            const hopDiv = document.createElement('div');
            hopDiv.className = hop.isDeadhead ? 'hop hop-deadhead' : 'hop';

            if (hop.action === 'DEADHEAD') {
                hopDiv.innerHTML = `
                    <div class="hop-number">Hop ${hop.hopNumber}: DEADHEAD (Repositioning)</div>
                    <div class="hop-details">
                        <div class="hop-detail">
                            <div class="hop-detail-label">From</div>
                            <div class="hop-detail-value location-name">${hop.locationName}</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">To</div>
                            <div class="hop-detail-value location-name">${hop.destinationName}</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Distance</div>
                            <div class="hop-detail-value">${hop.distance.toFixed(0)} million km</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Travel Time</div>
                            <div class="hop-detail-value">${hop.travelTime.toFixed(1)} min</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Fuel Cost</div>
                            <div class="hop-detail-value profit-negative">-${hop.cost.toLocaleString()} aUEC</div>
                        </div>
                    </div>
                `;
            } else {
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
                        <div class="hop-detail">
                            <div class="hop-detail-label">Cargo Value</div>
                            <div class="hop-detail-value">${(hop.cargoValue || hop.cost).toLocaleString()} aUEC</div>
                        </div>
                    `;
                } else if (hop.action === 'SELL') {
                    hopContent += `
                        <div class="hop-detail">
                            <div class="hop-detail-label">Total Revenue</div>
                            <div class="hop-detail-value profit-positive">+${hop.revenue.toLocaleString()} aUEC</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Profit</div>
                            <div class="hop-detail-value profit-positive">+${hop.profit.toLocaleString()} aUEC</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Margin</div>
                            <div class="hop-detail-value">${hop.margin}%</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Distance</div>
                            <div class="hop-detail-value">${hop.distance ? hop.distance.toFixed(0) + ' million km' : 'N/A'}</div>
                        </div>
                        <div class="hop-detail">
                            <div class="hop-detail-label">Travel Time</div>
                            <div class="hop-detail-value">${hop.travelTime ? hop.travelTime.toFixed(1) + ' min' : 'N/A'}</div>
                        </div>
                    `;
                }

                hopContent += `</div>`;
                hopDiv.innerHTML = hopContent;
            }
            
            hopsContainer.appendChild(hopDiv);
        });

        card.appendChild(hopsContainer);

        // Add summary with new metrics
        const summary = document.createElement('div');
        summary.className = 'route-summary';
        
        let summaryHTML = `
            <div class="summary-item">
                <div class="summary-label">Investment</div>
                <div class="summary-value">${route.investment.toLocaleString()} aUEC</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Profit</div>
                <div class="summary-value profit-positive">+${route.totalProfit.toLocaleString()} aUEC</div>
            </div>
        `;
        
        if (route.profitPerUnit) {
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">Profit per Unit</div>
                    <div class="summary-value">${route.profitPerUnit.toLocaleString()} aUEC</div>
                </div>
            `;
        }
        
        summaryHTML += `
            <div class="summary-item">
                <div class="summary-label">ROI</div>
                <div class="summary-value">${route.roi}%</div>
            </div>
        `;
        
        if (route.totalDistance) {
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">Total Distance</div>
                    <div class="summary-value">${route.totalDistance.toFixed(0)} million km</div>
                </div>
            `;
        }
        
        if (route.totalTime) {
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">Total Time</div>
                    <div class="summary-value">${route.totalTime.toFixed(1)} min</div>
                </div>
            `;
        }
        
        if (route.profitPerHour) {
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-label">Profit per Hour</div>
                    <div class="summary-value profit-positive">${route.profitPerHour.toLocaleString()} aUEC/hr</div>
                </div>
            `;
        }
        
        summary.innerHTML = summaryHTML;
        card.appendChild(summary);

        return card;
    }
}

// Initialize the planner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TradeRoutePlanner();
});
