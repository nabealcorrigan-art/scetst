#!/usr/bin/env python3
"""
Test runner script for Star Citizen Trade Planner data extraction tests.

This script provides a convenient way to run all tests and see a summary.
"""

import sys
import os
import subprocess


def main():
    """Run all tests and display summary."""
    print("=" * 70)
    print("Star Citizen Trade Planner - Data Extraction Test Harness")
    print("=" * 70)
    print()
    
    # Check for API key
    api_key = os.environ.get('UEX_API_KEY', '')
    if not api_key:
        print("⚠ WARNING: UEX_API_KEY environment variable not set!")
        print()
        print("To run these tests, you need a UEX Corp API key.")
        print("Get one from: https://uexcorp.space/api")
        print()
        print("Then set it as an environment variable:")
        print("  Linux/macOS: export UEX_API_KEY='your_key_here'")
        print("  Windows CMD: set UEX_API_KEY=your_key_here")
        print("  Windows PS:  $env:UEX_API_KEY='your_key_here'")
        print()
        print("Tests will be skipped without an API key.")
        print()
    else:
        print(f"✓ UEX_API_KEY found (length: {len(api_key)})")
        print()
    
    # Check for pytest
    try:
        result = subprocess.run(['pytest', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✓ pytest found: {result.stdout.strip()}")
        else:
            print("✗ pytest not found or not working")
            print("  Install with: pip install -r requirements.txt")
            return 1
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("✗ pytest not found!")
        print("  Install with: pip install -r requirements.txt")
        return 1
    
    print()
    print("-" * 70)
    print("Running Tests...")
    print("-" * 70)
    print()
    
    # Run pytest
    result = subprocess.run([
        'pytest', 
        '-v',          # Verbose
        '-s',          # Show print statements
        '--tb=short'   # Shorter traceback format
    ])
    
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
