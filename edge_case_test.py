#!/usr/bin/env python3
"""
Edge Case Testing for User-Reported Issues
Focus on specific scenarios that might cause "Failed to load" errors
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timezone, timedelta

BASE_URL = "https://pmtool.preview.emergentagent.com/api"

async def test_edge_cases():
    """Test edge cases that might cause user-reported failures"""
    
    async with aiohttp.ClientSession() as session:
        print("🔍 Testing Edge Cases for User-Reported Failures")
        
        # Test 1: Test with invalid/expired token
        print("\n--- Test 1: Invalid/Expired Token ---")
        headers = {"Authorization": "Bearer invalid_token_12345"}
        
        async with session.get(f"{BASE_URL}/work-orders", headers=headers) as response:
            print(f"Work Orders with invalid token: {response.status} - {await response.text()}")
            
        async with session.get(f"{BASE_URL}/machines", headers=headers) as response:
            print(f"Machines with invalid token: {response.status} - {await response.text()}")
            
        # Test 2: Test with no Authorization header
        print("\n--- Test 2: No Authorization Header ---")
        
        async with session.get(f"{BASE_URL}/work-orders") as response:
            print(f"Work Orders without auth: {response.status} - {await response.text()}")
            
        async with session.get(f"{BASE_URL}/machines") as response:
            print(f"Machines without auth: {response.status} - {await response.text()}")
            
        # Test 3: Test with malformed Authorization header
        print("\n--- Test 3: Malformed Authorization Header ---")
        headers = {"Authorization": "InvalidFormat token123"}
        
        async with session.get(f"{BASE_URL}/work-orders", headers=headers) as response:
            print(f"Work Orders with malformed auth: {response.status} - {await response.text()}")
            
        # Test 4: Test CORS and preflight requests
        print("\n--- Test 4: CORS Preflight Request ---")
        headers = {
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
            "Origin": "https://pmtool.preview.emergentagent.com"
        }
        
        async with session.options(f"{BASE_URL}/work-orders", headers=headers) as response:
            print(f"CORS preflight: {response.status}")
            print(f"CORS headers: {dict(response.headers)}")
            
        # Test 5: Test with expired trial user scenario
        print("\n--- Test 5: Simulated Expired Trial Scenario ---")
        
        # Register a user and immediately test access
        timestamp = str(int(time.time()))
        user_data = {
            "username": f"edge_test_user_{timestamp}",
            "email": f"edge_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "Admin"
        }
        
        async with session.post(f"{BASE_URL}/auth/register", json=user_data) as response:
            if response.status == 200:
                data = await response.json()
                token = data.get("access_token")
                print(f"User registered successfully")
                
                # Test immediate access
                headers = {"Authorization": f"Bearer {token}"}
                
                async with session.get(f"{BASE_URL}/subscription/status", headers=headers) as response:
                    status_data = await response.json()
                    print(f"Trial status: {status_data}")
                    
                async with session.get(f"{BASE_URL}/work-orders", headers=headers) as response:
                    print(f"Work orders access: {response.status}")
                    if response.status != 200:
                        print(f"Error: {await response.text()}")
                        
                async with session.get(f"{BASE_URL}/machines", headers=headers) as response:
                    print(f"Machines access: {response.status}")
                    if response.status != 200:
                        print(f"Error: {await response.text()}")
            else:
                print(f"User registration failed: {response.status} - {await response.text()}")
                
        # Test 6: Test network timeout scenarios
        print("\n--- Test 6: Network Timeout Test ---")
        timeout = aiohttp.ClientTimeout(total=1)  # 1 second timeout
        
        try:
            async with aiohttp.ClientSession(timeout=timeout) as timeout_session:
                async with timeout_session.get(f"{BASE_URL}/work-orders") as response:
                    print(f"Fast request completed: {response.status}")
        except asyncio.TimeoutError:
            print("Request timed out (this could cause 'Failed to load' errors)")
        except Exception as e:
            print(f"Network error: {e}")
            
        # Test 7: Test large response handling
        print("\n--- Test 7: Large Response Handling ---")
        
        # First register and get token
        async with session.post(f"{BASE_URL}/auth/register", json=user_data) as response:
            if response.status == 200:
                data = await response.json()
                token = data.get("access_token")
                headers = {"Authorization": f"Bearer {token}"}
                
                # Test getting all data at once
                async with session.get(f"{BASE_URL}/work-orders", headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"Work orders loaded: {len(data)} items")
                        
                        # Check for any malformed data
                        for i, wo in enumerate(data):
                            if not wo.get("id") or not wo.get("title"):
                                print(f"Malformed work order at index {i}: {wo}")
                    else:
                        print(f"Failed to load work orders: {response.status}")

if __name__ == "__main__":
    asyncio.run(test_edge_cases())