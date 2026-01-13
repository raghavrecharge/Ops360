# Phase 2: Frontend Implementation Guide

**Status**: Ready to Begin  
**Prerequisites**: Phase 1 Complete ✅  
**Estimated Time**: 20-25 hours  

---

## 🎯 Quick Start

### Test the Backend First
```bash
# 1. Check backend is running
curl http://localhost:8001/api/v1/roles/all
# Should return 14 roles

# 2. Test login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"Admin@2026"}'
# Should return JWT token

# 3. Test permissions API
curl http://localhost:8001/api/v1/roles/permissions
# Should return full permissions matrix
```

---

## 📋 Implementation Checklist

### Step 1: Menu Visibility (3 hours)
- [ ] Create API hook: `useRoleMenu()` in [frontend/src/hooks/](frontend/src/hooks/)
- [ ] Fetch menu items from `/api/v1/roles/menu`
- [ ] Update [Layout.js](frontend/src/components/Layout.js) to filter navigation
- [ ] Test with different role logins

**API Response Format**:
```json
{
  "admin": ["dashboard", "users", "clients", "projects", ...],
  "sales": ["dashboard", "clients", "projects", "reports"],
  "driver": ["dashboard", "trips", "expenses"]
}
```

**Implementation Hint**:
```javascript
// frontend/src/hooks/useRoleMenu.js
import { useState, useEffect } from 'react';

export const useRoleMenu = (userRole) => {
  const [menuItems, setMenuItems] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8001/api/v1/roles/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data[userRole] || []))
      .catch(console.error);
  }, [userRole]);
  
  return menuItems;
};
```

### Step 2: Route Protection (3 hours)
- [ ] Create `ProtectedRoute` component
- [ ] Fetch user permissions from `/api/v1/roles/permissions`
- [ ] Check required permission before rendering route
- [ ] Redirect to 403 page if unauthorized
- [ ] Update all routes in [App.js](frontend/src/App.js)

**Implementation Hint**:
```javascript
// frontend/src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/403" />;
  }
  
  return children;
};

// Usage in App.js
<Route path="/clients" element={
  <ProtectedRoute requiredPermission="client.read">
    <ClientsPage />
  </ProtectedRoute>
} />
```

### Step 3: Permission Hook (2 hours)
- [ ] Create `usePermissions()` hook
- [ ] Cache permissions in context
- [ ] Provide `hasPermission(permission)` function
- [ ] Export for use in all components

**Implementation Hint**:
```javascript
// frontend/src/hooks/usePermissions.js
import { useState, useEffect, useCallback } from 'react';

export const usePermissions = (userRole) => {
  const [permissions, setPermissions] = useState([]);
  
  useEffect(() => {
    if (!userRole) return;
    
    fetch('http://localhost:8001/api/v1/roles/permissions')
      .then(res => res.json())
      .then(data => setPermissions(data[userRole] || []))
      .catch(console.error);
  }, [userRole]);
  
  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);
  
  return { permissions, hasPermission };
};
```

### Step 4: Roles Management UI (5 hours)
- [ ] Create [frontend/src/pages/RolesManagement.js](frontend/src/pages/RolesManagement.js)
- [ ] Display all 14 roles in table
- [ ] Show permissions matrix (collapsible)
- [ ] Add search/filter functionality
- [ ] Style with Tailwind CSS
- [ ] Add to Settings navigation

**UI Mockup**:
```
┌─────────────────────────────────────────────────────┐
│ Roles & Permissions                                  │
├─────────────────────────────────────────────────────┤
│ Role          │ Users │ Permissions │ Actions       │
├─────────────────────────────────────────────────────┤
│ 🔴 Admin      │   1   │    50+      │ [View]       │
│ 💼 Sales      │   1   │     15      │ [View]       │
│ 🛒 Purchase   │   1   │     12      │ [View]       │
│ ⚙️  Operator  │   1   │     18      │ [View]       │
│ 🚗 Driver     │   1   │      5      │ [View]       │
└─────────────────────────────────────────────────────┘
```

**API Endpoints to Use**:
- GET `/api/v1/roles/all` - List roles
- GET `/api/v1/roles/permissions` - Get permissions matrix
- GET `/api/v1/users` - Count users per role

### Step 5: Component Permission Checks (4 hours)
- [ ] Update all CRUD pages with permission checks
- [ ] Hide "Create" button if no `*.create` permission
- [ ] Disable "Edit" button if no `*.update` permission
- [ ] Hide "Delete" button if no `*.delete` permission
- [ ] Show "View Only" badge when appropriate

**Pages to Update**:
- [frontend/src/pages/Clients.js](frontend/src/pages/Clients.js)
- [frontend/src/pages/Projects.js](frontend/src/pages/Projects.js)
- [frontend/src/pages/Campaigns.js](frontend/src/pages/Campaigns.js)
- [frontend/src/pages/Vehicles.js](frontend/src/pages/Vehicles.js)
- [frontend/src/pages/Drivers.js](frontend/src/pages/Drivers.js)
- [frontend/src/pages/Expenses.js](frontend/src/pages/Expenses.js)
- [frontend/src/pages/Reports.js](frontend/src/pages/Reports.js)
- [frontend/src/pages/Vendors.js](frontend/src/pages/Vendors.js)

**Implementation Pattern**:
```javascript
// Example: ClientsPage.js
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';

function ClientsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role);
  
  return (
    <div>
      <h1>Clients</h1>
      
      {hasPermission('client.create') && (
        <button onClick={handleCreate}>Create Client</button>
      )}
      
      <table>
        {clients.map(client => (
          <tr key={client.id}>
            <td>{client.name}</td>
            <td>
              {hasPermission('client.update') && (
                <button onClick={() => handleEdit(client.id)}>Edit</button>
              )}
              {hasPermission('client.delete') && (
                <button onClick={() => handleDelete(client.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### Step 6: Backend API Protection (8 hours)
- [ ] Create permission decorator: `@require_permission()`
- [ ] Update all API endpoints with permission checks
- [ ] Implement "own data only" filters for driver/promoter/anchor
- [ ] Return 403 for unauthorized attempts
- [ ] Test with different role accounts

**Implementation Pattern**:
```python
# backend/app/api/dependencies.py (NEW FILE)
from fastapi import Depends, HTTPException
from app.core.security import get_current_user
from app.core.role_permissions import RolePermissions, Permission
from app.models.user import User

def require_permission(permission: Permission):
    """Dependency to check if user has required permission"""
    def permission_checker(current_user: User = Depends(get_current_user)):
        if not RolePermissions.has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required: {permission.value}"
            )
        return current_user
    return permission_checker

# Usage in endpoints
from app.api.dependencies import require_permission

@router.post("/clients")
async def create_client(
    client: ClientCreate,
    current_user: User = Depends(require_permission(Permission.CLIENT_CREATE))
):
    # User has permission, proceed
    return await client_service.create(client)
```

**Endpoints to Update** (in order of priority):
1. [backend/app/api/v1/clients.py](backend/app/api/v1/clients.py) - 4 endpoints
2. [backend/app/api/v1/projects.py](backend/app/api/v1/projects.py) - 5 endpoints
3. [backend/app/api/v1/campaigns.py](backend/app/api/v1/campaigns.py) - 5 endpoints
4. [backend/app/api/v1/vehicles.py](backend/app/api/v1/vehicles.py) - 5 endpoints
5. [backend/app/api/v1/drivers.py](backend/app/api/v1/drivers.py) - 5 endpoints
6. [backend/app/api/v1/expenses.py](backend/app/api/v1/expenses.py) - 6 endpoints
7. [backend/app/api/v1/reports.py](backend/app/api/v1/reports.py) - 5 endpoints
8. [backend/app/api/v1/vendors.py](backend/app/api/v1/vendors.py) - 4 endpoints

### Step 7: Data Filtering for Limited Roles (3 hours)
- [ ] Implement "own data only" logic for driver
- [ ] Implement "own data only" logic for promoter
- [ ] Implement "own data only" logic for anchor
- [ ] Implement "own data only" logic for vendor
- [ ] Implement "own data only" logic for client

**Implementation Pattern**:
```python
# Example: Get campaigns for promoter (own only)
@router.get("/campaigns")
async def get_campaigns(
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.PROMOTER:
        # Return only campaigns assigned to this promoter
        return await campaign_service.get_by_promoter(current_user.id)
    elif current_user.role == UserRole.ADMIN:
        # Return all campaigns
        return await campaign_service.get_all()
    else:
        # Check permission and return appropriate data
        if not RolePermissions.has_permission(current_user.role, Permission.CAMPAIGN_READ):
            raise HTTPException(status_code=403)
        return await campaign_service.get_all()
```

### Step 8: Testing (2 hours)
- [ ] Create test checklist for each role
- [ ] Login as each role and verify menu
- [ ] Test unauthorized access returns 403
- [ ] Verify "own data only" works correctly
- [ ] Test all CRUD operations per role

**Test Matrix** (use this spreadsheet):
```
Role        | Login | Menu  | Create | Read | Update | Delete | Own Data
------------|-------|-------|--------|------|--------|--------|----------
Admin       |   ✅  |   ✅  |   ✅   |  ✅  |   ✅   |   ✅   |   N/A
Sales       |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   N/A
Purchase    |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   N/A
Operator    |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   N/A
Driver      |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   ⏳
Promoter    |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   ⏳
Anchor      |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   ⏳
Vehicle Mgr |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   N/A
Godown Mgr  |   ⏳  |   ⏳  |   ⏳   |  ⏳  |   ⏳   |   ⏳   |   N/A
```

---

## 🔍 API Reference

### Available Endpoints

#### Roles API
```bash
# Get all roles
GET /api/v1/roles/all
Response: ["admin", "sales", "purchase", ...]

# Get permissions by role
GET /api/v1/roles/permissions
Response: {
  "admin": ["user.create", "user.read", ...],
  "sales": ["client.create", "client.read", ...]
}

# Get menu visibility by role
GET /api/v1/roles/menu
Response: {
  "admin": ["dashboard", "users", "clients", ...],
  "sales": ["dashboard", "clients", "projects"]
}
```

#### Permission Values
Reference [backend/app/core/role_permissions.py](backend/app/core/role_permissions.py) for complete list.

**User Management**:
- `user.create`, `user.read`, `user.update`, `user.delete`
- `user.assign_roles`, `user.set_password`

**Client Management**:
- `client.create`, `client.read`, `client.update`, `client.delete`

**Project Management**:
- `project.create`, `project.read`, `project.update`, `project.delete`, `project.assign`

**Campaign Management**:
- `campaign.create`, `campaign.read`, `campaign.update`, `campaign.delete`
- `campaign.assign`, `campaign.execute`

**Vehicle Management**:
- `vehicle.create`, `vehicle.read`, `vehicle.update`, `vehicle.delete`, `vehicle.assign`

**Driver Management**:
- `driver.create`, `driver.read`, `driver.update`, `driver.delete`, `driver.assign`

**Expense Management**:
- `expense.create`, `expense.read`, `expense.update`, `expense.delete`
- `expense.approve`, `expense.submit`

**Report Management**:
- `report.create`, `report.read`, `report.update`, `report.delete`, `report.access_ml`

**Vendor Management**:
- `vendor.create`, `vendor.read`, `vendor.update`, `vendor.delete`

**Dashboard**:
- `dashboard.view`, `dashboard.analytics`, `dashboard.financial`

---

## 🎓 Common Patterns

### Pattern 1: Check Permission in Component
```javascript
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role);
  
  return (
    <div>
      {hasPermission('client.create') && <CreateButton />}
      {hasPermission('client.update') && <EditButton />}
      {hasPermission('client.delete') && <DeleteButton />}
    </div>
  );
}
```

### Pattern 2: Protect Route
```javascript
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route path="/clients" element={
  <ProtectedRoute requiredPermission="client.read">
    <ClientsPage />
  </ProtectedRoute>
} />
```

### Pattern 3: Check Permission in Backend
```python
from app.api.dependencies import require_permission
from app.core.role_permissions import Permission

@router.post("/clients")
async def create_client(
    client: ClientCreate,
    current_user: User = Depends(require_permission(Permission.CLIENT_CREATE))
):
    return await client_service.create(client)
```

### Pattern 4: Filter Own Data Only
```python
@router.get("/campaigns")
async def get_campaigns(current_user: User = Depends(get_current_user)):
    if current_user.role in [UserRole.DRIVER, UserRole.PROMOTER, UserRole.ANCHOR]:
        # Return only assigned campaigns
        return await campaign_service.get_by_user(current_user.id)
    else:
        # Return all (with permission check)
        if not RolePermissions.has_permission(current_user.role, Permission.CAMPAIGN_READ):
            raise HTTPException(status_code=403)
        return await campaign_service.get_all()
```

---

## 🐛 Troubleshooting

### Issue: Menu items not hiding
**Solution**: Check that `useRoleMenu()` hook is fetching correctly and user role is passed

### Issue: 403 errors on valid requests
**Solution**: Verify permission name matches exactly between frontend and backend

### Issue: "Own data only" showing all data
**Solution**: Check database relationships (user_id foreign keys) are set correctly

### Issue: Permission changes not reflecting
**Solution**: Clear localStorage and re-login to get fresh token with updated role

---

## 📚 Resources

### Key Files
- Permission Matrix: [backend/app/core/role_permissions.py](backend/app/core/role_permissions.py)
- User Model: [backend/app/models/user.py](backend/app/models/user.py)
- Roles API: [backend/app/api/v1/roles.py](backend/app/api/v1/roles.py)
- Implementation Plan: [RBAC_EXTENSION_PLAN.md](RBAC_EXTENSION_PLAN.md)
- Completion Summary: [RBAC_IMPLEMENTATION_COMPLETE.md](RBAC_IMPLEMENTATION_COMPLETE.md)

### Test Accounts
All passwords follow pattern: `Role@2026`

- admin@fleet.com
- sales@ops360.com
- purchase@ops360.com
- operator@ops360.com
- driver@ops360.com
- promoter@ops360.com
- anchor@ops360.com
- vehicle.mgr@ops360.com
- godown@ops360.com

---

## ✅ Definition of Done

Phase 2 is complete when:
- [ ] All menu items respect role visibility
- [ ] All routes are protected with permission checks
- [ ] All CRUD operations check permissions
- [ ] "Own data only" roles see only assigned data
- [ ] All 14 roles tested with login and access verification
- [ ] No regression issues in existing functionality
- [ ] Roles Management UI accessible from Settings
- [ ] 403 page shows for unauthorized access
- [ ] Frontend displays permission-aware UI elements
- [ ] Backend returns 403 for unauthorized API calls

---

**Good luck with Phase 2!** 🚀

The backend is fully ready and tested. All APIs are documented and working. You have complete test accounts for all roles. Follow the checklist step by step, and you'll have a fully functional RBAC system in 20-25 hours.

**Questions?** Refer to:
- [RBAC_IMPLEMENTATION_COMPLETE.md](RBAC_IMPLEMENTATION_COMPLETE.md) - Full backend documentation
- [RBAC_EXTENSION_PLAN.md](RBAC_EXTENSION_PLAN.md) - Original planning document
- [backend/app/core/role_permissions.py](backend/app/core/role_permissions.py) - Source of truth for all permissions
