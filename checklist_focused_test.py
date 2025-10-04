#!/usr/bin/env python3
"""
Focused test for work order checklist update functionality
Testing the exact scenario that might be causing frontend issues
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timezone

# Configuration
BASE_URL = "https://equiptrack-16.preview.emergentagent.com/api"
TIMESTAMP = str(int(time.time()))

async def test_checklist_update_scenarios():
    """Test specific checklist update scenarios that might cause frontend issues"""
    
    # Test user credentials
    test_user = {
        "username": f"checklist_test_{TIMESTAMP}",
        "email": f"checklist_test_{TIMESTAMP}@test.com",
        "password": "TestPass123!",
        "role": "Admin"
    }
    
    async with aiohttp.ClientSession() as session:
        print("🔍 Testing Work Order Checklist Update Scenarios")
        print(f"Testing against: {BASE_URL}")
        
        # Register/Login user
        async with session.post(f"{BASE_URL}/auth/register", json=test_user) as response:
            if response.status == 200:
                auth_data = await response.json()
                auth_token = auth_data.get("access_token")
                user_id = auth_data.get("user", {}).get("id")
                print("✅ User registered successfully")
            else:
                # Try login instead
                login_data = {"username": test_user["username"], "password": test_user["password"]}
                async with session.post(f"{BASE_URL}/auth/login", json=login_data) as login_response:
                    if login_response.status == 200:
                        auth_data = await login_response.json()
                        auth_token = auth_data.get("access_token")
                        user_id = auth_data.get("user", {}).get("id")
                        print("✅ User logged in successfully")
                    else:
                        print("❌ Failed to authenticate user")
                        return
        
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        
        # Create a work order
        work_order_data = {
            "title": "Checklist Update Test Work Order",
            "type": "PM",
            "priority": "High",
            "description": "Testing checklist update scenarios",
            "checklist_items": ["Initial task 1", "Initial task 2", "Initial task 3"]
        }
        
        async with session.post(f"{BASE_URL}/work-orders", json=work_order_data, headers=headers) as response:
            if response.status == 200:
                work_order = await response.json()
                work_order_id = work_order.get("id")
                print(f"✅ Work order created: {work_order_id}")
                print(f"   Initial checklist has {len(work_order.get('checklist', []))} items")
            else:
                print(f"❌ Failed to create work order: {response.status}")
                return
        
        # Test Scenario 1: Update checklist with completed items (common frontend scenario)
        print("\n--- Scenario 1: Update with completed checklist items ---")
        
        # Get current work order to see existing checklist
        async with session.get(f"{BASE_URL}/work-orders/{work_order_id}", headers=headers) as response:
            current_wo = await response.json()
            current_checklist = current_wo.get("checklist", [])
            print(f"Current checklist has {len(current_checklist)} items")
        
        # Update checklist with some completed items
        updated_checklist = []
        for i, item in enumerate(current_checklist):
            updated_item = {
                "id": item.get("id"),
                "text": item.get("text"),
                "completed": i % 2 == 0,  # Mark every other item as completed
                "completed_by": user_id if i % 2 == 0 else None,
                "completed_at": datetime.now(timezone.utc).isoformat() if i % 2 == 0 else None
            }
            updated_checklist.append(updated_item)
        
        update_data = {"checklist": updated_checklist}
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", json=update_data, headers=headers) as response:
            if response.status == 200:
                updated_wo = await response.json()
                updated_checklist_result = updated_wo.get("checklist", [])
                completed_count = sum(1 for item in updated_checklist_result if item.get("completed"))
                print(f"✅ Checklist updated successfully")
                print(f"   Updated checklist has {len(updated_checklist_result)} items")
                print(f"   {completed_count} items marked as completed")
                
                # Verify the data structure
                for item in updated_checklist_result:
                    if item.get("completed"):
                        if item.get("completed_by") and item.get("completed_at"):
                            print(f"   ✅ Completed item has proper metadata: {item.get('text')}")
                        else:
                            print(f"   ⚠️  Completed item missing metadata: {item.get('text')}")
            else:
                response_text = await response.text()
                print(f"❌ Failed to update checklist: {response.status}")
                print(f"   Response: {response_text}")
        
        # Test Scenario 2: Add new checklist items (another common scenario)
        print("\n--- Scenario 2: Add new checklist items ---")
        
        # Add new items to existing checklist
        new_checklist = updated_checklist + [
            {
                "id": f"new_item_{int(time.time())}",
                "text": "New dynamically added task",
                "completed": False
            },
            {
                "id": f"new_item_{int(time.time())}_2",
                "text": "Another new task",
                "completed": False
            }
        ]
        
        update_data = {"checklist": new_checklist}
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", json=update_data, headers=headers) as response:
            if response.status == 200:
                updated_wo = await response.json()
                final_checklist = updated_wo.get("checklist", [])
                print(f"✅ New items added successfully")
                print(f"   Final checklist has {len(final_checklist)} items")
            else:
                response_text = await response.text()
                print(f"❌ Failed to add new items: {response.status}")
                print(f"   Response: {response_text}")
        
        # Test Scenario 3: Test with exactly the data format frontend might send
        print("\n--- Scenario 3: Test frontend-like data format ---")
        
        # Simulate what frontend might send (without IDs, letting backend generate them)
        frontend_like_checklist = [
            {
                "text": "Frontend task 1",
                "completed": True,
                "completed_by": user_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "text": "Frontend task 2", 
                "completed": False
            },
            {
                "text": "Frontend task 3",
                "completed": True,
                "completed_by": user_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        update_data = {"checklist": frontend_like_checklist}
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", json=update_data, headers=headers) as response:
            if response.status == 200:
                updated_wo = await response.json()
                frontend_result = updated_wo.get("checklist", [])
                print(f"✅ Frontend-like data processed successfully")
                print(f"   Result checklist has {len(frontend_result)} items")
                
                # Check if IDs were auto-generated
                for item in frontend_result:
                    if item.get("id"):
                        print(f"   ✅ Item has auto-generated ID: {item.get('text')}")
                    else:
                        print(f"   ⚠️  Item missing ID: {item.get('text')}")
            else:
                response_text = await response.text()
                print(f"❌ Failed with frontend-like data: {response.status}")
                print(f"   Response: {response_text}")
        
        print("\n🏁 Checklist Update Testing Complete")
        print("If all scenarios passed, the backend is working correctly.")
        print("Any 'Failed to save checklist' errors are likely frontend issues.")

if __name__ == "__main__":
    asyncio.run(test_checklist_update_scenarios())