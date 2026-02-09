"""
Test for validating commodity data extraction from UEX Corp API.

This test validates that we can successfully retrieve and parse commodity
data from the UEX Corp API endpoint.
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
ENDPOINT = "/commodities"


class TestCommodityData:
    """Test suite for commodity data extraction."""
    
    @pytest.fixture
    def api_key(self):
        """Get API key from environment variable."""
        api_key = os.environ.get('UEX_API_KEY', '')
        if not api_key:
            pytest.skip("UEX_API_KEY environment variable not set")
        return api_key
    
    def test_commodity_data_extraction(self, api_key):
        """
        Test that commodity data can be successfully extracted.
        
        Validates:
        - API endpoint is accessible
        - Response contains commodity data
        - Commodity data has required fields (id, name, etc.)
        """
        url = f"{BASE_URL}{ENDPOINT}"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing commodity data extraction")
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
            assert len(data) > 0, "No commodity data returned"
            
            logger.info(f"Total commodities found: {len(data)}")
            
            # Examine first commodity
            first_commodity = data[0]
            logger.info(f"Example commodity data: {first_commodity}")
            
            # Validate required fields exist
            required_fields = ['id', 'name']
            for field in required_fields:
                assert field in first_commodity or f'id_{field}' in first_commodity or \
                       f'{field}_commodity' in first_commodity, \
                       f"Required field '{field}' or variant not found in commodity data"
            
            # Log example values
            commodity_id = first_commodity.get('id') or first_commodity.get('id_commodity')
            commodity_name = first_commodity.get('name') or first_commodity.get('commodity_name') or first_commodity.get('name_commodity')
            
            logger.info(f"✓ Successfully extracted commodity data")
            logger.info(f"✓ Example commodity ID: {commodity_id}")
            logger.info(f"✓ Example commodity name: {commodity_name}")
            
            # Additional validation - check for other useful fields
            if 'kind' in first_commodity or 'type' in first_commodity:
                commodity_type = first_commodity.get('kind') or first_commodity.get('type')
                logger.info(f"✓ Commodity type/kind field found: {commodity_type}")
            
            if 'is_illegal' in first_commodity or 'illegal' in first_commodity:
                is_illegal = first_commodity.get('is_illegal') or first_commodity.get('illegal')
                logger.info(f"✓ Illegal status field found: {is_illegal}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch commodity data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise
        except Exception as e:
            logger.error(f"✗ Unexpected error: {e}")
            pytest.fail(f"Unexpected error during commodity data extraction: {e}")


if __name__ == "__main__":
    # Allow running test directly with: python test_commodity_data.py
    pytest.main([__file__, "-v", "-s"])
