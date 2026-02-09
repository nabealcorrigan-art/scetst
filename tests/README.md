# Star Citizen Trade Planner - Data Extraction Test Harness

This directory contains validation tests for data extraction from the UEX Corp API used by the Star Citizen Trade Route Planner.

## Overview

These tests validate that all necessary data types can be successfully extracted from the source site (UEX Corp API). Each test is focused on a specific data type and provides clear PASS/FAIL results with detailed logging.

## Prerequisites

1. **Python 3.7+** installed
2. **UEX Corp API Key** - Get one from [https://uexcorp.space/api](https://uexcorp.space/api)
3. **Python packages** - Install with: `pip install -r requirements.txt`

## Setup

1. Install dependencies:
   ```bash
   cd tests
   pip install -r requirements.txt
   ```

2. Set your API key as an environment variable:
   ```bash
   # Linux/macOS
   export UEX_API_KEY="your_api_key_here"
   
   # Windows (Command Prompt)
   set UEX_API_KEY=your_api_key_here
   
   # Windows (PowerShell)
   $env:UEX_API_KEY="your_api_key_here"
   ```

## Running Tests

### Run All Tests
```bash
pytest -v -s
```

### Run Individual Tests
```bash
# Test commodity data extraction
pytest test_commodity_data.py -v -s

# Test location/station data extraction
pytest test_location_data.py -v -s

# Test buy/sell price data extraction
pytest test_price_data.py -v -s

# Test supply/demand fields
pytest test_supply_demand.py -v -s

# Test ROI-relevant fields
pytest test_roi_fields.py -v -s
```

### Run Directly with Python
```bash
python test_commodity_data.py
```

## Test Descriptions

### 1. `test_commodity_data.py` - Commodity Data Extraction
**What it tests:**
- Validates that commodity data can be fetched from `/commodities` endpoint
- Checks for required fields: commodity ID, name
- Verifies optional fields: type/kind, illegal status

**What it proves:**
- We can retrieve the list of tradeable commodities
- Commodity data has sufficient detail for trade calculations
- Legal/illegal commodity filtering is possible

**Example output:**
```
✓ Successfully extracted commodity data
✓ Example commodity ID: 123
✓ Example commodity name: Agricultural Supplies
✓ Commodity type/kind field found: Agricultural
✓ Illegal status field found: False
```

### 2. `test_location_data.py` - Location/Station/System Data Extraction
**What it tests:**
- Validates that location data can be fetched from `/locations` endpoint
- Checks for required fields: location ID, name
- Verifies optional fields: system, planet, location type, coordinates

**What it proves:**
- We can retrieve trading locations (stations, outposts)
- Location data includes system and region information
- Coordinate data is available for distance calculations (if present)

**Example output:**
```
✓ Successfully extracted location data
✓ Example location ID: 456
✓ Example location name: Port Olisar
✓ System field found: Stanton
✓ Location type field found: Space Station
✓ Coordinate field 'x' found: 1234567.89
```

### 3. `test_price_data.py` - Buy/Sell Price Data Extraction
**What it tests:**
- Validates that price data can be fetched from `/commodities_prices` endpoint
- Checks for commodity and location references
- Verifies buy and sell price fields exist
- Counts entries with buy vs sell prices

**What it proves:**
- We can retrieve current market prices
- Prices are linked to specific commodities and locations
- Both buy and sell prices are available for trade calculation
- We have sufficient price data for route planning

**Example output:**
```
✓ Commodity reference field 'id_commodity' found: 123
✓ Location reference field 'id_location' found: 456
✓ Buy price field 'price_buy' found: 5.25
✓ Sell price field 'price_sell' found: 6.50
✓ Buy prices found in 87 of first 100 entries
✓ Sell prices found in 92 of first 100 entries
```

### 4. `test_supply_demand.py` - Supply/Demand Field Extraction
**What it tests:**
- Validates supply/demand fields in `/commodities_prices` endpoint
- Checks for stock/quantity/availability fields
- Verifies demand fields if present

**What it proves:**
- We can determine commodity availability at locations
- Supply constraints can be factored into route planning
- Demand information is available (if provided by API)

**Example output:**
```
✓ Supply field 'scu_buy_max' found
  Example value: 1000
✓ Supply data found in 45 entries (of first 100)
  Example supply values: [1000, 500, 2000, 750, 1200]
⚠ No demand data found in sample
✓ Supply/demand extraction test completed
```

### 5. `test_roi_fields.py` - ROI-Relevant Field Extraction
**What it tests:**
- **Price fields**: Validates buy/sell prices for ROI calculation
- **Distance fields**: Checks for coordinate data for distance calculations
- **Availability fields**: Verifies stock/quantity data

**What it proves:**
- We have all necessary data to calculate Return on Investment
- Trade profitability can be determined (sell price - buy price)
- Distance can be factored into efficiency calculations
- Stock availability can limit trade volume

**Example output:**
```
✓ Found 67 entries with both buy/sell prices (from first 200)
✓ Example trade opportunity:
  Buy price: 5.25 aUEC
  Sell price: 6.50 aUEC
  Profit margin: 1.25 aUEC
  ROI: 23.81%
✓ Best ROI found: 85.67%
✓ Found 12 locations with coordinate data (from first 50)
✓ Found 45 entries with availability data (from first 100)
```

## Test Output Format

Each test provides:
1. **URL/Endpoint**: The API endpoint being tested
2. **HTTP Method**: GET (all current tests)
3. **Response Status**: HTTP status code
4. **Parsing Method**: JSON response parsing
5. **Example Values**: Sample data extracted from the API
6. **Pass/Fail Status**: Clear indication via pytest output

## Success Criteria

### PASS Conditions:
- API endpoint is accessible (status 200)
- Response contains expected data
- Required fields are present
- Data values are reasonable/valid

### FAIL Conditions:
- API endpoint unreachable (network error, timeout)
- Authentication failure (invalid API key)
- Missing required fields
- Empty or invalid response data

## Limitations

These tests are designed for **validation only**:
- ✅ No data is stored or persisted
- ✅ Minimal API calls (one per test)
- ✅ No aggressive crawling or scraping
- ✅ No authentication mechanisms added
- ✅ Lightweight dependencies (pytest + requests)

## Troubleshooting

### API Key Issues
If tests are skipped with "UEX_API_KEY environment variable not set":
1. Verify you set the environment variable correctly
2. In the same terminal session, check: `echo $UEX_API_KEY` (Linux/macOS) or `echo %UEX_API_KEY%` (Windows)
3. Make sure there are no extra spaces or quotes in the value

### Connection Errors
If you see connection errors:
1. Check your internet connection
2. Verify the UEX Corp API is online: https://uexcorp.space/api
3. Check for rate limiting (UEX Corp: 10 requests/minute, 14,400/day)

### Missing Fields
If tests fail due to missing fields:
1. Review the test output - it shows available fields
2. The API structure may have changed
3. Update tests to match current API structure

## Data Viability Summary

Based on test results, you can determine which data types are viable for the trade planner:

| Data Type | Test File | Key Viability Indicators |
|-----------|-----------|-------------------------|
| Commodities | `test_commodity_data.py` | Total count, name/ID present, legal/illegal flag |
| Locations | `test_location_data.py` | Total count, name/ID present, coordinate data |
| Prices | `test_price_data.py` | Buy/sell coverage, price range validity |
| Supply/Demand | `test_supply_demand.py` | Field availability, quantity ranges |
| ROI Metrics | `test_roi_fields.py` | Profit margins, distance data, stock limits |

## Next Steps

After running tests:
1. Review which data types passed validation
2. Note any missing or unavailable fields
3. Adjust trade planner logic based on available data
4. Document any API limitations or constraints
5. Consider fallback strategies for missing data

## Contributing

To add new tests:
1. Follow the existing test structure
2. Include detailed logging with `logger.info()`
3. Use flexible field name checking (APIs may vary)
4. Provide clear pass/fail assertions
5. Add test description to this README

## License

MIT License - Same as parent project
