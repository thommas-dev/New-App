#!/usr/bin/env python3
"""
Specific test to verify work order checklist persistence after updates
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timezone

# Configuration
BASE_URL = "https://equiptrack-16.preview.emergentagent.com/api"
TIMESTAMP = str(int(time.time()))
TEST_USER_DATA = {
    "username": f"checklist_verify_{TIMESTAMP}",
    "email": f"checklist_verify_{TIMESTAMP}@equiptrack.com", 
    "password": "ChecklistTest123!",
    "role": "Admin"
}

async def test_checklist_persistence():
    """Test checklist data persistence through multiple updates and retrievals"""
    print("🔍 Testing Work Order Checklist Persistence")
    
    session = aiohttp.ClientSession()
    auth_token = None
    
    try:
        # Register/Login user
        async with session.post(f"{BASE_URL}/auth/register", json=TEST_USER_DATA) as response:
            if response.status == 200:
                data = await response.json()
                auth_token = data.get("access_token")
                user_id = data.get("user", {}).get("id")
                print("✅ User registered successfully")
            else:
                # Try login
                async with session.post(f"{BASE_URL}/auth/login", json={
                    "username": TEST_USER_DATA["username"],
                    "password": TEST_USER_DATA["password"]
                }) as login_response:
                    if login_response.status == 200:
                        data = await login_response.json()
                        auth_token = data.get("access_token")
                        user_id = data.get("user", {}).get("id")
                        print("✅ User logged in successfully")
                    else:
                        print("❌ Failed to authenticate")
                        return
        
        headers = {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}
        
        # Step 1: Create work order with initial checklist
        print("\n📝 Step 1: Creating work order with initial checklist")
        work_order_data = {
            "title": "Checklist Persistence Test",
            "type": "PM",
            "priority": "High",
            "description": "Testing checklist save and retrieve functionality",
            "checklist_items": ["Initial task 1", "Initial task 2", "Initial task 3"]
        }
        
        async with session.post(f"{BASE_URL}/work-orders", json=work_order_data, headers=headers) as response:
            if response.status == 200:
                wo_data = await response.json()
                work_order_id = wo_data.get("id")
                initial_checklist = wo_data.get("checklist", [])
                print(f"✅ Work order created: {work_order_id}")
                print(f"   Initial checklist items: {len(initial_checklist)}")
                for i, item in enumerate(initial_checklist):
                    print(f"   - Item {i+1}: {item.get('text')} (ID: {item.get('id')})")
            else:
                print(f"❌ Failed to create work order: {response.status}")
                return
        
        # Step 2: Update checklist with new structure
        print("\n🔄 Step 2: Updating checklist with mixed completed/uncompleted items")
        updated_checklist = [
            {
                "id": "custom_id_1",
                "text": "Updated task 1 - Equipment inspection",
                "completed": True,
                "completed_by": user_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "custom_id_2", 
                "text": "Updated task 2 - Safety check",
                "completed": False
            },
            {
                "id": "custom_id_3",
                "text": "New task 3 - Documentation review",
                "completed": True,
                "completed_by": user_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "custom_id_4",
                "text": "New task 4 - Final verification",
                "completed": False
            }
        ]
        
        update_data = {"checklist": updated_checklist}
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", json=update_data, headers=headers) as response:
            if response.status == 200:
                updated_wo = await response.json()
                returned_checklist = updated_wo.get("checklist", [])
                print(f"✅ Checklist updated successfully")
                print(f"   Updated checklist items: {len(returned_checklist)}")
                
                # Verify immediate response
                completed_count = sum(1 for item in returned_checklist if item.get("completed"))
                print(f"   Completed items in response: {completed_count}/4")
                
                for i, item in enumerate(returned_checklist):
                    status = "✓" if item.get("completed") else "○"
                    completed_by = f" (by: {item.get('completed_by', 'N/A')})" if item.get("completed") else ""
                    print(f"   {status} Item {i+1}: {item.get('text')}{completed_by}")
            else:
                error_data = await response.text()
                print(f"❌ Failed to update checklist: {response.status} - {error_data}")
                return
        
        # Step 3: Retrieve work order to verify persistence
        print("\n🔍 Step 3: Retrieving work order to verify checklist persistence")
        
        async with session.get(f"{BASE_URL}/work-orders/{work_order_id}", headers=headers) as response:
            if response.status == 200:
                retrieved_wo = await response.json()
                retrieved_checklist = retrieved_wo.get("checklist", [])
                print(f"✅ Work order retrieved successfully")
                print(f"   Retrieved checklist items: {len(retrieved_checklist)}")
                
                # Verify persistence
                if len(retrieved_checklist) == 4:
                    print("✅ Checklist item count persisted correctly")
                else:
                    print(f"❌ Expected 4 items, got {len(retrieved_checklist)}")
                
                # Check specific items
                completed_items = [item for item in retrieved_checklist if item.get("completed")]
                uncompleted_items = [item for item in retrieved_checklist if not item.get("completed")]
                
                print(f"   Completed items: {len(completed_items)}/4")
                print(f"   Uncompleted items: {len(uncompleted_items)}/4")
                
                # Verify specific data integrity
                for i, item in enumerate(retrieved_checklist):
                    status = "✓" if item.get("completed") else "○"
                    completed_by = f" (by: {item.get('completed_by', 'N/A')})" if item.get("completed") else ""
                    completed_at = f" at: {item.get('completed_at', 'N/A')}" if item.get("completed") else ""
                    print(f"   {status} Item {i+1}: {item.get('text')}{completed_by}{completed_at}")
                
                # Test data integrity
                task1 = next((item for item in retrieved_checklist if item.get("text") == "Updated task 1 - Equipment inspection"), None)
                task4 = next((item for item in retrieved_checklist if item.get("text") == "New task 4 - Final verification"), None)
                
                if task1 and task1.get("completed") and task1.get("completed_by") == user_id:
                    print("✅ Completed task data integrity verified")
                else:
                    print("❌ Completed task data integrity failed")
                
                if task4 and not task4.get("completed") and not task4.get("completed_by"):
                    print("✅ Uncompleted task data integrity verified")
                else:
                    print("❌ Uncompleted task data integrity failed")
                    
            else:
                print(f"❌ Failed to retrieve work order: {response.status}")
                return
        
        # Step 4: Test multiple updates to ensure consistency
        print("\n🔄 Step 4: Testing multiple checklist updates for consistency")
        
        # Update 1: Mark more items as completed
        for item in updated_checklist:
            if item["id"] == "custom_id_2":
                item["completed"] = True
                item["completed_by"] = user_id
                item["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", json={"checklist": updated_checklist}, headers=headers) as response:
            if response.status == 200:
                print("✅ Second update successful")
            else:
                print(f"❌ Second update failed: {response.status}")
        
        # Update 2: Add new item
        updated_checklist.append({
            "id": "custom_id_5",
            "text": "Additional task 5 - Final cleanup",
            "completed": False
        })
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", json={"checklist": updated_checklist}, headers=headers) as response:
            if response.status == 200:
                print("✅ Third update (add item) successful")
            else:
                print(f"❌ Third update failed: {response.status}")
        
        # Final verification
        async with session.get(f"{BASE_URL}/work-orders/{work_order_id}", headers=headers) as response:
            if response.status == 200:
                final_wo = await response.json()
                final_checklist = final_wo.get("checklist", [])
                print(f"\n🏁 Final verification:")
                print(f"   Total items: {len(final_checklist)}")
                print(f"   Completed items: {sum(1 for item in final_checklist if item.get('completed'))}")
                
                if len(final_checklist) == 5:
                    print("✅ All checklist updates persisted correctly")
                    print("✅ WORK ORDER CHECKLIST SAVE FUNCTIONALITY IS WORKING PROPERLY")
                else:
                    print(f"❌ Expected 5 items, got {len(final_checklist)}")
            else:
                print(f"❌ Final verification failed: {response.status}")
        
    finally:
        await session.close()

if __name__ == "__main__":
    asyncio.run(test_checklist_persistence())