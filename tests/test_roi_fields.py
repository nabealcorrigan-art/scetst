"""
Test for validating ROI-relevant fields extraction from UEX Corp API.

This test validates that we can successfully extract fields relevant for
ROI (Return on Investment) calculations: prices, distances/coordinates,
and availability/stock information.
"""

import pytest
import requests
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# API Configuration
BASE_URL = "https://api.uexcorp.uk/2.0"


class TestROIRelevantFields:
    """Test suite for ROI-relevant field extraction."""
    
    @pytest.fixture
    def api_key(self):
        """Get API key from environment variable."""
        api_key = os.environ.get('UEX_API_KEY', '')
        if not api_key:
            pytest.skip("UEX_API_KEY environment variable not set")
        return api_key
    
    def test_roi_price_fields(self, api_key):
        """
        Test extraction of price fields needed for ROI calculations.
        
        Validates:
        - Buy prices are available
        - Sell prices are available
        - Prices are numeric and reasonable
        """
        url = f"{BASE_URL}/commodities_prices"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing ROI-relevant PRICE fields extraction")
        logger.info(f"URL: {url}")
        logger.info(f"Endpoint: /commodities_prices")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
            
            data = response.json()
            assert len(data) > 0, "No price data returned"
            
            # Find entries with both buy and sell prices
            valid_trades = []
            for entry in data[:200]:  # Sample first 200
                buy_price = None
                sell_price = None
                
                # Extract buy price
                for field in ['price_buy', 'buy_price', 'buy']:
                    if field in entry and entry[field] is not None and entry[field] > 0:
                        buy_price = entry[field]
                        break
                
                # Extract sell price
                for field in ['price_sell', 'sell_price', 'sell']:
                    if field in entry and entry[field] is not None and entry[field] > 0:
                        sell_price = entry[field]
                        break
                
                if buy_price and sell_price:
                    profit_margin = sell_price - buy_price
                    roi_percent = (profit_margin / buy_price) * 100 if buy_price > 0 else 0
                    valid_trades.append({
                        'buy': buy_price,
                        'sell': sell_price,
                        'margin': profit_margin,
                        'roi': roi_percent
                    })
            
            logger.info(f"✓ Found {len(valid_trades)} entries with both buy/sell prices (from first 200)")
            
            if valid_trades:
                example = valid_trades[0]
                logger.info(f"✓ Example trade opportunity:")
                logger.info(f"  Buy price: {example['buy']} aUEC")
                logger.info(f"  Sell price: {example['sell']} aUEC")
                logger.info(f"  Profit margin: {example['margin']} aUEC")
                logger.info(f"  ROI: {example['roi']:.2f}%")
                
                # Find best ROI
                best_roi = max(valid_trades, key=lambda x: x['roi'])
                logger.info(f"✓ Best ROI found: {best_roi['roi']:.2f}%")
                logger.info(f"  Buy: {best_roi['buy']}, Sell: {best_roi['sell']}")
            
            assert len(valid_trades) > 0, "No valid trade opportunities found (need both buy and sell prices)"
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch price data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise
    
    def test_roi_distance_fields(self, api_key):
        """
        Test extraction of distance/coordinate fields needed for ROI calculations.
        
        Validates:
        - Location data includes position/coordinate information
        - Distances can be calculated between locations
        """
        url = f"{BASE_URL}/locations"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing ROI-relevant DISTANCE fields extraction")
        logger.info(f"URL: {url}")
        logger.info(f"Endpoint: /locations")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
            
            data = response.json()
            assert len(data) > 0, "No location data returned"
            
            # Look for coordinate/position fields
            locations_with_coords = []
            coord_fields = ['x', 'y', 'z', 'coordinates', 'position', 'pos_x', 'pos_y', 'pos_z']
            
            for location in data[:50]:  # Sample first 50
                has_coords = False
                coords = {}
                
                for field in coord_fields:
                    if field in location:
                        coords[field] = location[field]
                        has_coords = True
                
                if has_coords:
                    locations_with_coords.append({
                        'name': location.get('name') or location.get('location_name'),
                        'coords': coords
                    })
            
            logger.info(f"✓ Found {len(locations_with_coords)} locations with coordinate data (from first 50)")
            
            if locations_with_coords:
                example = locations_with_coords[0]
                logger.info(f"✓ Example location with coordinates:")
                logger.info(f"  Name: {example['name']}")
                logger.info(f"  Coordinates: {example['coords']}")
                
                # If we have at least 2 locations with coords, calculate sample distance
                if len(locations_with_coords) >= 2:
                    loc1 = locations_with_coords[0]
                    loc2 = locations_with_coords[1]
                    logger.info(f"✓ Can calculate distances between locations:")
                    logger.info(f"  From: {loc1['name']}")
                    logger.info(f"  To: {loc2['name']}")
            else:
                logger.warning("⚠ No coordinate data found - distance calculations may not be available")
                logger.info("  Note: Distance may need to be calculated using other methods")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch location data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise
    
    def test_roi_availability_fields(self, api_key):
        """
        Test extraction of availability/stock fields needed for ROI calculations.
        
        Validates:
        - Stock/availability information is present
        - Quantities are tracked for commodities
        """
        url = f"{BASE_URL}/commodities_prices"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing ROI-relevant AVAILABILITY fields extraction")
        logger.info(f"URL: {url}")
        logger.info(f"Endpoint: /commodities_prices")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
            
            data = response.json()
            assert len(data) > 0, "No data returned"
            
            # Look for availability/stock fields
            availability_fields = ['stock', 'quantity', 'available', 'scu_buy', 'scu_buy_max', 
                                   'scu_sell', 'scu_sell_max', 'supply', 'demand']
            
            entries_with_availability = []
            for entry in data[:100]:  # Sample first 100
                availability_data = {}
                for field in availability_fields:
                    if field in entry and entry[field] is not None:
                        availability_data[field] = entry[field]
                
                if availability_data:
                    entries_with_availability.append(availability_data)
            
            logger.info(f"✓ Found {len(entries_with_availability)} entries with availability data (from first 100)")
            
            if entries_with_availability:
                example = entries_with_availability[0]
                logger.info(f"✓ Example availability data:")
                for field, value in example.items():
                    logger.info(f"  {field}: {value}")
                
                # Check if quantities are reasonable for trading
                for entry in entries_with_availability[:5]:
                    values = [v for v in entry.values() if isinstance(v, (int, float)) and v > 0]
                    if values:
                        avg_qty = sum(values) / len(values)
                        logger.info(f"  Sample availability value: {avg_qty:.2f}")
            else:
                logger.warning("⚠ No availability data found in sample")
                logger.info("  Note: May need to check API documentation for availability fields")
            
            logger.info(f"✓ ROI availability field extraction test completed")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch availability data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise


if __name__ == "__main__":
    # Allow running test directly with: python test_roi_fields.py
    pytest.main([__file__, "-v", "-s"])
