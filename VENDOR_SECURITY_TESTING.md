# Vendor Dashboard Security - Test Cases & Validation

## 🧪 Test Setup

### Prerequisites
1. Backend running: `docker compose ps backend` shows "healthy"
2. Frontend accessible at http://localhost:3000
3. Multiple vendor test data created
4. Admin and vendor user accounts created

## 📋 Test Plan

### Phase 1: Backend API Testing

#### Test 1.1: Menu Counts API Authentication
```bash
# Test without token (should fail with 401)
curl -X GET http://localhost:8001/api/v1/vendor-dashboard/menu-counts

# Expected Response:
# {"detail": "Not authenticated"}
```

#### Test 1.2: Menu Counts API with Valid Token
```bash
# Step 1: Login as vendor
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor1@example.com","password":"password123"}'

# Copy the "access_token" from response

# Step 2: Get menu counts
curl -X GET http://localhost:8001/api/v1/vendor-dashboard/menu-counts \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"

# Expected Response:
# {"vehicle_count": 2, "driver_count": 3, "campaign_count": 0}
```

#### Test 1.3: Verify Vendor Isolation
```bash
# Login as Vendor A
TOKEN_A=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendorA@example.com","password":"password"}' | jq -r '.access_token')

# Get Vendor A's menu counts
curl -s -H "Authorization: Bearer $TOKEN_A" \
  http://localhost:8001/api/v1/vendor-dashboard/menu-counts | jq

# Login as Vendor B
TOKEN_B=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendorB@example.com","password":"password"}' | jq -r '.access_token')

# Get Vendor B's menu counts
curl -s -H "Authorization: Bearer $TOKEN_B" \
  http://localhost:8001/api/v1/vendor-dashboard/menu-counts | jq

# ✅ PASS: Counts should be DIFFERENT for each vendor
# ❌ FAIL: If counts are the same → Data isolation broken
```

### Phase 2: Frontend UI Testing

#### Test 2.1: Dynamic Tab Visibility

**Test Steps**:
1. Create Vendor A with:
   - 3 vehicles (vehicle_numbers: VA-001, VA-002, VA-003)
   - 2 drivers (names: Driver A1, Driver A2)
2. Create vendor user account: vendorA@example.com
3. Login to frontend as vendorA@example.com
4. Navigate to `/vendor-dashboard`

**Expected Behavior**:
- ✅ "Overview" tab visible
- ✅ "Campaigns (0)" tab visible (or higher count if assigned)
- ✅ "Vehicles (3)" tab visible
- ✅ "Drivers (2)" tab visible
- ✅ "Invoices" tab visible
- ✅ "Payments" tab visible

**Verify**:
- Click "Vehicles" tab → Should show VA-001, VA-002, VA-003
- Click "Drivers" tab → Should show Driver A1, Driver A2

#### Test 2.2: Hidden Tabs (Zero Data)

**Test Steps**:
1. Create Vendor B with:
   - 1 vehicle (vehicle_number: VB-001)
   - 0 drivers
2. Create vendor user account: vendorB@example.com
3. Login as vendorB@example.com
4. Navigate to `/vendor-dashboard`

**Expected Behavior**:
- ✅ "Vehicles (1)" tab visible
- ❌ "Drivers" tab HIDDEN (not visible at all)
- ✅ Other tabs visible

**Verify**:
- Click "Vehicles" tab → Should show only VB-001
- "Drivers" tab should not appear in the tab list

#### Test 2.3: Zero Data for Both

**Test Steps**:
1. Create Vendor C with:
   - 0 vehicles
   - 0 drivers
2. Create vendor user account: vendorC@example.com
3. Login as vendorC@example.com
4. Navigate to `/vendor-dashboard`

**Expected Behavior**:
- ✅ "Overview" tab visible
- ✅ "Campaigns (0)" tab visible
- ❌ "Vehicles" tab HIDDEN
- ❌ "Drivers" tab HIDDEN
- ✅ "Invoices" tab visible
- ✅ "Payments" tab visible

**Verify**:
- No crashes or errors
- Clean empty state messages
- Can still upload invoices and view payments

### Phase 3: Data Isolation Testing

#### Test 3.1: Cross-Vendor Data Access (Security Test)

**Test Steps**:
1. Login as Vendor A (has vehicles VA-001, VA-002)
2. Note down vehicle IDs from the vehicles list
3. Logout
4. Login as Vendor B (has vehicle VB-001)
5. Try to access Vendor A's vehicle directly:
   - Open browser DevTools → Network tab
   - Try to navigate to `/vehicles/{vendor_a_vehicle_id}`

**Expected Behavior**:
- ✅ Backend returns 404 or 403 error
- ❌ CRITICAL FAIL: If Vendor B can see Vendor A's vehicle details

**Alternative Test (Backend)**:
```bash
# Get Vendor A's vehicle ID
TOKEN_A=<vendor_a_token>
VEHICLE_ID=$(curl -s -H "Authorization: Bearer $TOKEN_A" \
  http://localhost:8001/api/v1/vehicles | jq -r '.[0].id')

# Try to access with Vendor B's token
TOKEN_B=<vendor_b_token>
curl -s -H "Authorization: Bearer $TOKEN_B" \
  http://localhost:8001/api/v1/vehicles/$VEHICLE_ID

# Expected: 403 Forbidden or 404 Not Found
```

#### Test 3.2: Driver Data Isolation

**Test Steps**:
1. Login as Vendor A
2. Navigate to vendor dashboard → Drivers tab
3. Note driver IDs
4. Logout
5. Login as Vendor B
6. Navigate to vendor dashboard
7. Check Drivers tab (if visible) or try direct API access

**Expected Behavior**:
- ✅ Vendor B sees ONLY their own drivers
- ✅ Vendor B cannot access Vendor A's driver details

### Phase 4: Admin Access Testing

#### Test 4.1: Admin Can See All Data

**Test Steps**:
1. Login as admin user
2. Navigate to:
   - `/vehicles` → Should see ALL vehicles from all vendors
   - `/drivers` → Should see ALL drivers from all vendors
   - `/vendor-dashboard` (if admin can access) → Should see aggregated counts

**Expected Behavior**:
- ✅ Admin sees vehicles: VA-001, VA-002, VA-003, VB-001, VC-001, etc.
- ✅ Admin sees drivers from all vendors
- ✅ No vendor_id restriction applied

### Phase 5: Performance Testing

#### Test 5.1: Large Dataset Performance

**Test Setup**:
1. Create Vendor D with:
   - 100 vehicles
   - 50 drivers

**Test Steps**:
1. Login as Vendor D
2. Navigate to vendor dashboard
3. Measure page load time
4. Click Vehicles tab → Measure tab load time
5. Click Drivers tab → Measure tab load time

**Expected Behavior**:
- ✅ Menu counts API responds < 500ms
- ✅ Vehicles tab loads < 2 seconds
- ✅ Drivers tab loads < 2 seconds
- ✅ No browser freezing or lag

### Phase 6: Edge Cases

#### Test 6.1: Vendor with Deleted Data

**Test Steps**:
1. Create Vendor E with 2 vehicles
2. Login as Vendor E → Verify "Vehicles (2)" tab shows
3. Admin deletes (soft delete) 1 vehicle
4. Refresh Vendor E's dashboard

**Expected Behavior**:
- ✅ "Vehicles (1)" tab shows
- ✅ Only active vehicle visible

#### Test 6.2: New Vendor Registration

**Test Steps**:
1. Register new vendor user through registration flow
2. Auto-link to existing vendor (if email/phone matches)
3. Login as new vendor user
4. Navigate to vendor dashboard

**Expected Behavior**:
- ✅ Menu counts reflect vendor's existing vehicles/drivers
- ✅ If no auto-link, shows 0 counts (admin must manually link)

#### Test 6.3: Session Timeout

**Test Steps**:
1. Login as vendor
2. Wait for token expiration (1440 minutes default)
3. Try to access vendor dashboard

**Expected Behavior**:
- ✅ Redirect to login page
- ✅ After re-login, counts refresh correctly

## 🎯 Success Criteria

### Must Pass:
- ✅ **Isolation**: Each vendor sees ONLY their own data
- ✅ **Dynamic Menus**: Tabs hide when count = 0
- ✅ **No Errors**: No crashes or 500 errors
- ✅ **Performance**: API responds < 500ms
- ✅ **Security**: Cross-vendor access returns 403/404

### Should Pass:
- ✅ Admin can see all data
- ✅ Zero data cases show clean UI
- ✅ Real-time updates after creating vehicles/drivers

## 📊 Test Results Template

```
=== VENDOR DASHBOARD SECURITY TEST RESULTS ===
Date: _______________
Tester: _______________

Phase 1: Backend API Testing
  [ ] Test 1.1: Authentication - PASS/FAIL
  [ ] Test 1.2: Valid Token - PASS/FAIL
  [ ] Test 1.3: Vendor Isolation - PASS/FAIL

Phase 2: Frontend UI Testing
  [ ] Test 2.1: Dynamic Tabs - PASS/FAIL
  [ ] Test 2.2: Hidden Tabs - PASS/FAIL
  [ ] Test 2.3: Zero Data - PASS/FAIL

Phase 3: Data Isolation Testing
  [ ] Test 3.1: Cross-Vendor Access - PASS/FAIL
  [ ] Test 3.2: Driver Isolation - PASS/FAIL

Phase 4: Admin Access Testing
  [ ] Test 4.1: Admin Sees All - PASS/FAIL

Phase 5: Performance Testing
  [ ] Test 5.1: Large Dataset - PASS/FAIL

Phase 6: Edge Cases
  [ ] Test 6.1: Deleted Data - PASS/FAIL
  [ ] Test 6.2: New Registration - PASS/FAIL
  [ ] Test 6.3: Session Timeout - PASS/FAIL

Issues Found:
_________________________________________________
_________________________________________________
_________________________________________________

Overall Status: PASS/FAIL
```

## 🐛 Known Issues & Workarounds

### Issue 1: Tailwind Grid Columns
**Problem**: Dynamic `grid-cols-X` classes may not work
**Workaround**: Use fixed grid with conditional rendering (already implemented)

### Issue 2: JWT Token Refresh
**Problem**: Token expires after 24 hours
**Workaround**: Implement token refresh mechanism (future enhancement)

## 📞 Debugging Commands

### Check Backend Logs
```bash
docker logs -f fleet_backend | grep -E "(vendor-dashboard|menu-counts|ERROR)"
```

### Check Database
```sql
-- Verify vendor data
SELECT id, name, email, phone FROM vendors WHERE is_active = 1;

-- Check vehicles per vendor
SELECT vendor_id, COUNT(*) as vehicle_count 
FROM vehicles 
WHERE is_active = 1 
GROUP BY vendor_id;

-- Check drivers per vendor
SELECT vendor_id, COUNT(*) as driver_count 
FROM drivers 
WHERE is_active = 1 
GROUP BY vendor_id;

-- Verify user vendor links
SELECT u.id, u.email, u.role, u.vendor_id, v.name as vendor_name
FROM users u
LEFT JOIN vendors v ON u.vendor_id = v.id
WHERE u.role = 'vendor';
```

### Check Frontend Console
```javascript
// In browser console
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('token'));
```

## 🚀 Quick Test Script

```bash
#!/bin/bash
# Quick test script for vendor dashboard security

echo "=== Vendor Dashboard Security Test ==="
echo ""

# Test 1: Backend health
echo "Test 1: Backend Health"
curl -s http://localhost:8001/health | jq '.status'
echo ""

# Test 2: Menu counts API (should fail without token)
echo "Test 2: Menu Counts API (No Auth)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/v1/vendor-dashboard/menu-counts)
if [ "$STATUS" == "401" ]; then
  echo "✅ PASS: Returns 401 without auth"
else
  echo "❌ FAIL: Expected 401, got $STATUS"
fi
echo ""

# Test 3: Login and get menu counts
echo "Test 3: Login and Get Menu Counts"
echo "Enter vendor email: "
read VENDOR_EMAIL
echo "Enter password: "
read -s VENDOR_PASSWORD

TOKEN=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$VENDOR_EMAIL\",\"password\":\"$VENDOR_PASSWORD\"}" | jq -r '.access_token')

if [ "$TOKEN" != "null" ]; then
  echo "✅ Login successful"
  echo "Menu Counts:"
  curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:8001/api/v1/vendor-dashboard/menu-counts | jq
else
  echo "❌ Login failed"
fi

echo ""
echo "=== Test Complete ==="
```

Save as `test_vendor_security.sh` and run:
```bash
chmod +x test_vendor_security.sh
./test_vendor_security.sh
```
