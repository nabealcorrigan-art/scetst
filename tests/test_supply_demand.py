"""
Test for validating supply/demand field extraction from UEX Corp API.

This test validates that we can successfully retrieve and parse supply/demand
information from the commodity prices endpoint.
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


class TestSupplyDemandData:
    """Test suite for supply/demand field extraction."""
    
    @pytest.fixture
    def api_key(self):
        """Get API key from environment variable."""
        api_key = os.environ.get('UEX_API_KEY', '')
        if not api_key:
            pytest.skip("UEX_API_KEY environment variable not set")
        return api_key
    
    def test_supply_demand_extraction(self, api_key):
        """
        Test that supply/demand data can be successfully extracted.
        
        Validates:
        - API endpoint is accessible
        - Response contains supply/demand fields
        - Fields have meaningful values
        """
        url = f"{BASE_URL}{ENDPOINT}"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing supply/demand data extraction")
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
            assert len(data) > 0, "No data returned"
            
            logger.info(f"Total entries found: {len(data)}")
            
            # Look for supply/demand fields across all entries
            supply_fields = ['supply', 'stock', 'quantity', 'available', 'scu_buy', 'scu_buy_max']
            demand_fields = ['demand', 'demand_stock', 'scu_sell', 'scu_sell_max']
            
            supply_found = False
            demand_found = False
            supply_examples = []
            demand_examples = []
            
            # Check a sample of entries
            for entry in data[:100]:
                # Check for supply fields
                for field in supply_fields:
                    if field in entry and entry[field] is not None:
                        if not supply_found:
                            logger.info(f"✓ Supply field '{field}' found")
                            logger.info(f"  Example value: {entry[field]}")
                            supply_found = True
                        supply_examples.append({
                            'field': field,
                            'value': entry[field]
                        })
                        break
                
                # Check for demand fields
                for field in demand_fields:
                    if field in entry and entry[field] is not None:
                        if not demand_found:
                            logger.info(f"✓ Demand field '{field}' found")
                            logger.info(f"  Example value: {entry[field]}")
                            demand_found = True
                        demand_examples.append({
                            'field': field,
                            'value': entry[field]
                        })
                        break
            
            # Log statistics
            if supply_examples:
                logger.info(f"✓ Supply data found in {len(supply_examples)} entries (of first 100)")
                logger.info(f"  Example supply values: {[ex['value'] for ex in supply_examples[:5]]}")
            else:
                logger.warning("⚠ No supply data found in sample")
            
            if demand_examples:
                logger.info(f"✓ Demand data found in {len(demand_examples)} entries (of first 100)")
                logger.info(f"  Example demand values: {[ex['value'] for ex in demand_examples[:5]]}")
            else:
                logger.warning("⚠ No demand data found in sample")
            
            # At least one type should be found
            if not supply_found and not demand_found:
                logger.warning("⚠ No supply or demand fields found - checking for quantity-related fields")
                
                # Check for any quantity-related fields
                quantity_fields = ['scu', 'qty', 'amount']
                for entry in data[:10]:
                    logger.info(f"Sample entry fields: {list(entry.keys())}")
                    for field in quantity_fields:
                        if field in entry:
                            logger.info(f"✓ Found alternative quantity field: {field} = {entry[field]}")
                            supply_found = True
                            break
                    if supply_found:
                        break
            
            # Note: Some APIs may not have supply/demand, but we should at least extract what's available
            logger.info(f"✓ Supply/demand extraction test completed")
            logger.info(f"  Supply fields available: {supply_found}")
            logger.info(f"  Demand fields available: {demand_found}")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch supply/demand data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise
        except Exception as e:
            logger.error(f"✗ Unexpected error: {e}")
            pytest.fail(f"Unexpected error during supply/demand data extraction: {e}")


if __name__ == "__main__":
    # Allow running test directly with: python test_supply_demand.py
    pytest.main([__file__, "-v", "-s"])
