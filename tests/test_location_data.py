"""
Test for validating location/station/system data extraction from UEX Corp API.

This test validates that we can successfully retrieve and parse location
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
ENDPOINT = "/locations"


class TestLocationData:
    """Test suite for location/station/system data extraction."""
    
    @pytest.fixture
    def api_key(self):
        """Get API key from environment variable."""
        api_key = os.environ.get('UEX_API_KEY', '')
        if not api_key:
            pytest.skip("UEX_API_KEY environment variable not set")
        return api_key
    
    def test_location_data_extraction(self, api_key):
        """
        Test that location data can be successfully extracted.
        
        Validates:
        - API endpoint is accessible
        - Response contains location data
        - Location data has required fields (id, name, system, etc.)
        """
        url = f"{BASE_URL}{ENDPOINT}"
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        logger.info(f"Testing location data extraction")
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
            assert len(data) > 0, "No location data returned"
            
            logger.info(f"Total locations found: {len(data)}")
            
            # Examine first location
            first_location = data[0]
            logger.info(f"Example location data: {first_location}")
            
            # Validate required fields exist (flexible field names)
            required_fields = ['id', 'name']
            for field in required_fields:
                assert field in first_location or f'id_{field}' in first_location or \
                       f'{field}_location' in first_location or f'location_{field}' in first_location, \
                       f"Required field '{field}' or variant not found in location data"
            
            # Log example values
            location_id = first_location.get('id') or first_location.get('id_location')
            location_name = first_location.get('name') or first_location.get('location_name') or first_location.get('name_location')
            
            logger.info(f"✓ Successfully extracted location data")
            logger.info(f"✓ Example location ID: {location_id}")
            logger.info(f"✓ Example location name: {location_name}")
            
            # Additional validation - check for system/planet information
            if 'system' in first_location or 'system_name' in first_location:
                system_name = first_location.get('system') or first_location.get('system_name')
                logger.info(f"✓ System field found: {system_name}")
            
            if 'planet' in first_location or 'planet_name' in first_location:
                planet_name = first_location.get('planet') or first_location.get('planet_name')
                logger.info(f"✓ Planet field found: {planet_name}")
            
            if 'type' in first_location or 'location_type' in first_location:
                location_type = first_location.get('type') or first_location.get('location_type')
                logger.info(f"✓ Location type field found: {location_type}")
                
            # Check for coordinate/position data (useful for distance calculations)
            coord_fields = ['x', 'y', 'z', 'coordinates', 'position']
            found_coords = False
            for coord in coord_fields:
                if coord in first_location:
                    logger.info(f"✓ Coordinate field '{coord}' found: {first_location[coord]}")
                    found_coords = True
            
            if not found_coords:
                logger.info("⚠ No coordinate fields found (may affect distance calculations)")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Request failed: {e}")
            pytest.fail(f"Failed to fetch location data: {e}")
        except AssertionError as e:
            logger.error(f"✗ Validation failed: {e}")
            raise
        except Exception as e:
            logger.error(f"✗ Unexpected error: {e}")
            pytest.fail(f"Unexpected error during location data extraction: {e}")


if __name__ == "__main__":
    # Allow running test directly with: python test_location_data.py
    pytest.main([__file__, "-v", "-s"])
