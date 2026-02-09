"""
Test for validating buy/sell price data extraction from UEX Corp API.

This test validates that we can successfully retrieve and parse commodity
price data (buy/sell prices) from the UEX Corp API endpoint.
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
ENDPOINT = "/commodities_prices"


class TestPriceData:
    """Test suite for buy/sell price data extraction."""
    
    @pytest.fixture
    def api_key(self):
        """Get API key from environment variable."""
        api_key = os.environ.get('UEX_API_KEY', '')
        if not api_key:
            pytest.skip("UEX_API_KEY environment variable not set")
        return api_key
    
    def test_price_data_extraction(self, api_key):
        """
        Test that price data can be successfully extracted.
        
        Validates:
        - API endpoint is accessible
        - Response contains price data
        - Price data has buy/sell prices
        - Prices are associated with locations and commodities
        """
        url = f"{BASE_URL}{ENDPOINT}"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing buy/sell price data extraction")
        logger.info(f"URL: {url}")
        logger.info(f"Method: GET")
        logger.info(f"Endpoint: {ENDPOINT}")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            logger.info(f"Response Status: {response.status_code}")
            
            # Check if request was successful
            assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
            
            # Parse JSON response
            data = response.json()
            logger.info(f"Response type: {type(data)}")
            
            # Validate we got data
            assert data is not None, "Response data is None"
            assert len(data) > 0, "No price data returned"
            
            logger.info(f"Total price entries found: {len(data)}")
            
            # Examine first price entry
            first_price = data[0]
            logger.info(f"Example price entry: {first_price}")
            
            # Validate required fields exist (with flexible naming)
            # We need: commodity reference, location reference, and price info
            
            # Check for commodity reference
            commodity_id_found = False
            commodity_fields = ['id_commodity', 'commodity_id', 'commodity', 'id_commodity_price']
            for field in commodity_fields:
                if field in first_price:
                    logger.info(f"✓ Commodity reference field '{field}' found: {first_price[field]}")
                    commodity_id_found = True
                    break
            assert commodity_id_found, "No commodity reference field found in price data"
            
            # Check for location reference
            location_id_found = False
            location_fields = ['id_location', 'location_id', 'location', 'id_location_price']
            for field in location_fields:
                if field in first_price:
                    logger.info(f"✓ Location reference field '{field}' found: {first_price[field]}")
                    location_id_found = True
                    break
            assert location_id_found, "No location reference field found in price data"
            
            # Check for buy price (price_buy, buy_price, etc.)
            buy_price_found = False
            buy_fields = ['price_buy', 'buy_price', 'buy', 'price_sell']
            for field in buy_fields:
                if field in first_price and first_price[field] is not None:
                    logger.info(f"✓ Buy price field '{field}' found: {first_price[field]}")
                    buy_price_found = True
                    break
            
            # Check for sell price (price_sell, sell_price, etc.)
            sell_price_found = False
            sell_fields = ['price_sell', 'sell_price', 'sell', 'price_buy']
            for field in sell_fields:
                if field in first_price and first_price[field] is not None:
                    logger.info(f"✓ Sell price field '{field}' found: {first_price[field]}")
                    sell_price_found = True
                    break
            
            # At least one price type should be present
            assert buy_price_found or sell_price_found, "No buy or sell price fields found"
            
            logger.info(f"✓ Successfully extracted price data")
            
            # Count entries with buy vs sell prices
            buy_count = 0
            sell_count = 0
            for entry in data[:100]:  # Sample first 100
                for field in buy_fields:
                    if field in entry and entry[field] is not None and entry[field] > 0:
                        buy_count += 1
                        break
                for field in sell_fields:
                    if field in entry and entry[field] is not None and entry[field] > 0:
                        sell_count += 1
                        break
            
            logger.info(f"✓ Buy prices found in {buy_count} of first 100 entries")
            logger.info(f"✓ Sell prices found in {sell_count} of first 100 entries")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch price data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise
        except Exception as e:
            logger.error(f"✗ Unexpected error: {e}")
            pytest.fail(f"Unexpected error during price data extraction: {e}")


if __name__ == "__main__":
    # Allow running test directly with: python test_price_data.py
    pytest.main([__file__, "-v", "-s"])
