#!/usr/bin/env python3
"""
Focused Checklist Persistence Test
Tests the specific scenario reported by user: Save → Close → Reopen → Changes are gone
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timezone

# Configuration
BASE_URL = "https://pmtool.preview.emergentagent.com/api"
TIMESTAMP = str(int(time.time()))

async def test_checklist_persistence():
    """Test the exact scenario reported by user"""
    print("🔍 FOCUSED TEST: Checklist Save → Close → Reopen Persistence")
    print(f"Testing against: {BASE_URL}")
    
    # Setup
    session = aiohttp.ClientSession()
    
    try:
        # Step 1: Login/Register user
        print("\n--- Step 1: Authentication ---")
        user_data = {
            "username": f"persistence_test_{TIMESTAMP}",
            "email": f"persistence_test_{TIMESTAMP}@test.com",
            "password": "TestPass123!",
            "role": "Admin"
        }
        
        # Try login first
        async with session.post(f"{BASE_URL}/auth/login", json={
            "username": user_data["username"],
            "password": user_data["password"]
        }) as response:
            if response.status == 200:
                auth_data = await response.json()
            else:
                # Register new user
                async with session.post(f"{BASE_URL}/auth/register", json=user_data) as reg_response:
                    if reg_response.status != 200:
                        print(f"❌ Failed to register user: {await reg_response.text()}")
                        return
                    auth_data = await reg_response.json()
        
        auth_token = auth_data["access_token"]
        user_id = auth_data["user"]["id"]
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        print(f"✅ Authenticated as user: {auth_data['user']['username']}")
        
        # Step 2: Get a specific work order with existing checklist
        print("\n--- Step 2: Get work order with existing checklist ---")
        async with session.get(f"{BASE_URL}/work-orders", headers=headers) as response:
            if response.status != 200:
                print(f"❌ Failed to get work orders: {await response.text()}")
                return
            
            work_orders = await response.json()
            
        # Find work order with checklist or create one
        target_wo = None
        for wo in work_orders:
            if wo.get("checklist") and len(wo["checklist"]) > 0:
                target_wo = wo
                break
                
        if not target_wo:
            # Create work order with initial checklist
            wo_data = {
                "title": "Persistence Test Work Order",
                "type": "PM",
                "priority": "High",
                "description": "Testing checklist persistence",
                "checklist_items": ["Check oil levels", "Inspect belts"]
            }
            
            async with session.post(f"{BASE_URL}/work-orders", json=wo_data, headers=headers) as response:
                if response.status != 200:
                    print(f"❌ Failed to create work order: {await response.text()}")
                    return
                target_wo = await response.json()
        
        work_order_id = target_wo["id"]
        original_checklist = target_wo.get("checklist", [])
        
        print(f"✅ Using work order: {target_wo.get('wo_id')} with {len(original_checklist)} checklist items")
        print(f"   Original checklist: {[item.get('text') for item in original_checklist]}")
        
        # Step 3: Modify checklist items (mark some as completed, add new items)
        print("\n--- Step 3: Modify checklist items ---")
        
        # Create the exact data structure from the user's request
        modified_checklist = [
            {
                "id": "item-1",
                "text": "Check oil levels", 
                "completed": True,
                "completed_by": user_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "item-2", 
                "text": "Inspect belts",
                "completed": False
            },
            {
                "id": "item-3",
                "text": "New task: Test emergency stops",
                "completed": True,
                "completed_by": user_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        print(f"   Modified checklist: {len(modified_checklist)} items")
        for item in modified_checklist:
            status = "✓ COMPLETED" if item["completed"] else "○ PENDING"
            print(f"     {status} {item['text']}")
        
        # Step 4: Send PUT request to update the work order with modified checklist
        print("\n--- Step 4: Save checklist changes ---")
        
        update_data = {"checklist": modified_checklist}
        
        async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", 
                              json=update_data, headers=headers) as response:
            if response.status != 200:
                print(f"❌ Failed to save checklist: {await response.text()}")
                return
            
            save_response = await response.json()
            saved_checklist = save_response.get("checklist", [])
            
        print(f"✅ Checklist saved successfully - {len(saved_checklist)} items saved")
        
        # Step 5: Immediately retrieve the same work order again (simulating reopen)
        print("\n--- Step 5: Reopen work order (immediate retrieval) ---")
        
        async with session.get(f"{BASE_URL}/work-orders/{work_order_id}", headers=headers) as response:
            if response.status != 200:
                print(f"❌ Failed to retrieve work order: {await response.text()}")
                return
            
            retrieved_wo = await response.json()
            retrieved_checklist = retrieved_wo.get("checklist", [])
        
        print(f"✅ Work order retrieved - {len(retrieved_checklist)} checklist items found")
        
        # Step 6: Verify all checklist changes persisted correctly
        print("\n--- Step 6: Verify persistence ---")
        
        # Check if all changes persisted
        persistence_success = True
        issues = []
        
        # Check item count
        if len(retrieved_checklist) != len(modified_checklist):
            persistence_success = False
            issues.append(f"Item count mismatch: expected {len(modified_checklist)}, got {len(retrieved_checklist)}")
        
        # Check each item
        for expected_item in modified_checklist:
            found_item = None
            for retrieved_item in retrieved_checklist:
                if retrieved_item.get("id") == expected_item["id"]:
                    found_item = retrieved_item
                    break
            
            if not found_item:
                persistence_success = False
                issues.append(f"Item '{expected_item['id']}' not found")
                continue
            
            # Check text
            if found_item.get("text") != expected_item.get("text"):
                persistence_success = False
                issues.append(f"Item '{expected_item['id']}' text changed")
            
            # Check completion status
            if found_item.get("completed") != expected_item.get("completed"):
                persistence_success = False
                issues.append(f"Item '{expected_item['id']}' completion status changed")
            
            # Check completion metadata for completed items
            if expected_item.get("completed"):
                if not found_item.get("completed_by") or not found_item.get("completed_at"):
                    persistence_success = False
                    issues.append(f"Item '{expected_item['id']}' missing completion metadata")
        
        # Report results
        if persistence_success:
            print("✅ ALL CHECKLIST CHANGES PERSISTED CORRECTLY!")
            print("\n📋 Final checklist state:")
            for item in retrieved_checklist:
                status = "✓ COMPLETED" if item.get("completed") else "○ PENDING"
                completed_info = ""
                if item.get("completed") and item.get("completed_by"):
                    completed_info = f" (by {item.get('completed_by')} at {item.get('completed_at')})"
                print(f"     {status} {item.get('text')}{completed_info}")
            
            print(f"\n🎉 CONCLUSION: Checklist persistence is WORKING CORRECTLY")
            print("   - Save operation successful")
            print("   - All items persisted after reopen")
            print("   - Completion status maintained")
            print("   - Completion metadata preserved")
            
        else:
            print("❌ CHECKLIST PERSISTENCE ISSUES FOUND!")
            for issue in issues:
                print(f"   - {issue}")
            
            print(f"\n💥 CONCLUSION: Checklist persistence has PROBLEMS")
            
        # Step 7: Test multiple cycles (as requested)
        print("\n--- Step 7: Test multiple save/reopen cycles ---")
        
        for cycle in range(3):
            print(f"\n  🔄 Cycle {cycle + 1}/3")
            
            # Modify checklist
            cycle_checklist = []
            for item in retrieved_checklist:
                cycle_item = item.copy()
                cycle_item["text"] = f"{item.get('text')} [Updated Cycle {cycle + 1}]"
                # Toggle completion
                cycle_item["completed"] = not item.get("completed", False)
                if cycle_item["completed"]:
                    cycle_item["completed_by"] = user_id
                    cycle_item["completed_at"] = datetime.now(timezone.utc).isoformat()
                else:
                    cycle_item.pop("completed_by", None)
                    cycle_item.pop("completed_at", None)
                cycle_checklist.append(cycle_item)
            
            # Save
            async with session.put(f"{BASE_URL}/work-orders/{work_order_id}", 
                                  json={"checklist": cycle_checklist}, headers=headers) as response:
                if response.status != 200:
                    print(f"     ❌ Save failed: {await response.text()}")
                    break
            
            # Reopen
            async with session.get(f"{BASE_URL}/work-orders/{work_order_id}", headers=headers) as response:
                if response.status != 200:
                    print(f"     ❌ Reopen failed: {await response.text()}")
                    break
                
                cycle_retrieved = await response.json()
                retrieved_checklist = cycle_retrieved.get("checklist", [])
            
            # Quick check
            if len(retrieved_checklist) == len(cycle_checklist):
                print(f"     ✅ Cycle {cycle + 1} successful - {len(retrieved_checklist)} items persisted")
            else:
                print(f"     ❌ Cycle {cycle + 1} failed - item count mismatch")
                break
        else:
            print(f"\n✅ All 3 save/reopen cycles completed successfully!")
            
    finally:
        await session.close()

if __name__ == "__main__":
    asyncio.run(test_checklist_persistence())