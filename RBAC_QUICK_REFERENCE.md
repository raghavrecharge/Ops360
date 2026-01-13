# RBAC System - Quick Reference Card

## 🎯 All 14 Roles at a Glance

| Role | Code | Primary Function | Key Permissions | Menu Access |
|------|------|------------------|-----------------|-------------|
| 🔴 **Admin** | `admin` | System administration | Full access (50+ permissions) | All menus |
| 💼 **Sales** | `sales` | Client acquisition | Client CRUD, Project read, Expense submit | Dashboard, Clients, Projects, Reports |
| 🛒 **Purchase** | `purchase` | Vendor & procurement | Vendor CRUD, Expense manage, Inventory | Dashboard, Vendors, Expenses, Inventory |
| ⚙️ **Operator** | `operator` | Campaign execution | Campaign execute, Promoter/Anchor manage | Dashboard, Campaigns, Promoters, Expenses |
| 🚗 **Driver** | `driver` | Vehicle operations | Own trips only, Expense submit | Dashboard, Trips, Expenses |
| 📢 **Promoter** | `promoter` | Field promotion | Own campaigns only, Report create | Dashboard, Campaigns, Reports, Expenses |
| 🎤 **Anchor** | `anchor` | Event hosting | Own events only, Report create | Dashboard, Events, Reports, Expenses |
| 🚙 **Vehicle Manager** | `vehicle_manager` | Fleet management | Vehicle CRUD, Driver assign, Maintenance | Dashboard, Vehicles, Drivers, Expenses |
| 📦 **Godown Manager** | `godown_manager` | Inventory control | Inventory CRUD, Stock tracking | Dashboard, Inventory, Vendors, Reports |
| 👔 **Client Servicing** | `client_servicing` | Client relationship | Project manage, Campaign read | Dashboard, Clients, Projects, Campaigns |
| 👨‍💼 **Operations Manager** | `operations_manager` | Operations oversight | Campaign CRUD, Expense approve | Dashboard, Campaigns, Expenses, Reports |
| 💰 **Accounts** | `accounts` | Financial management | Expense approve, Financial dashboard | Dashboard, Expenses, Reports, Analytics |
| 🏢 **Vendor** | `vendor` | External vendor | Own data only, Expense submit | Dashboard, Projects, Expenses |
| 👤 **Client** | `client` | End client | Own projects only, Report view | Dashboard, Projects, Reports |

---

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fleet.com | Admin@2026 |
| Sales | sales@ops360.com | Sales@2026 |
| Purchase | purchase@ops360.com | Purchase@2026 |
| Operator | operator@ops360.com | Operator@2026 |
| Driver | driver@ops360.com | Driver@2026 |
| Promoter | promoter@ops360.com | Promoter@2026 |
| Anchor | anchor@ops360.com | Anchor@2026 |
| Vehicle Manager | vehicle.mgr@ops360.com | Vehicle@2026 |
| Godown Manager | godown@ops360.com | Godown@2026 |

---

## 🔌 API Quick Reference

```bash
# Base URL
http://localhost:8001/api/v1

# Get all roles
GET /roles/all

# Get permissions matrix
GET /roles/permissions

# Get menu visibility
GET /roles/menu

# Login
POST /auth/login
Body: {"email": "admin@fleet.com", "password": "Admin@2026"}

# Register new user
POST /auth/register
Body: {"email": "...", "password": "...", "name": "...", "role": "sales"}

# Set user password (admin only)
POST /users/{user_id}/set-password
Body: {"password": "NewPass@2026", "password_hint": "Optional hint"}
Header: Authorization: Bearer {admin_jwt_token}
```

---

## 📊 Permission Categories (50+)

### User Management (6)
`user.create` `user.read` `user.update` `user.delete` `user.assign_roles` `user.set_password`

### Client Management (4)
`client.create` `client.read` `client.update` `client.delete`

### Project Management (5)
`project.create` `project.read` `project.update` `project.delete` `project.assign`

### Campaign Management (6)
`campaign.create` `campaign.read` `campaign.update` `campaign.delete` `campaign.assign` `campaign.execute`

### Vehicle Management (5)
`vehicle.create` `vehicle.read` `vehicle.update` `vehicle.delete` `vehicle.assign`

### Driver Management (5)
`driver.create` `driver.read` `driver.update` `driver.delete` `driver.assign`

### Expense Management (6)
`expense.create` `expense.read` `expense.update` `expense.delete` `expense.approve` `expense.submit`

### Report Management (5)
`report.create` `report.read` `report.update` `report.delete` `report.access_ml`

### Vendor Management (4)
`vendor.create` `vendor.read` `vendor.update` `vendor.delete`

### Dashboard (3)
`dashboard.view` `dashboard.analytics` `dashboard.financial`

---

## 💻 Code Snippets

### Frontend: Check Permission
```javascript
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';

const { user } = useAuth();
const { hasPermission } = usePermissions(user?.role);

{hasPermission('client.create') && <CreateButton />}
```

### Backend: Require Permission
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

### Check Permission Manually
```python
from app.core.role_permissions import RolePermissions, Permission

if RolePermissions.has_permission(user.role, Permission.CLIENT_CREATE):
    # Allow action
    pass
```

---

## 🎯 Implementation Status

### ✅ Phase 1: Backend (Complete)
- [x] Database ENUM extended to 14 roles
- [x] SQLAlchemy models updated
- [x] Permissions matrix created (50+ permissions)
- [x] Roles API endpoints implemented
- [x] Test accounts created
- [x] Backend fully tested

### ⏳ Phase 2: Frontend (Pending)
- [ ] Menu visibility implementation
- [ ] Route protection
- [ ] Permission hooks
- [ ] Component permission checks
- [ ] Roles Management UI
- [ ] Backend API protection
- [ ] Data filtering (own only)
- [ ] End-to-end testing

---

## 📁 Important Files

### Backend
- `backend/app/core/role_permissions.py` - **Permissions matrix (source of truth)**
- `backend/app/models/user.py` - User model with roles
- `backend/app/api/v1/roles.py` - Roles API endpoints
- `backend/app/core/permissions.py` - UserRole enum

### Frontend (To Create)
- `frontend/src/hooks/usePermissions.js` - Permission check hook
- `frontend/src/hooks/useRoleMenu.js` - Menu visibility hook
- `frontend/src/components/ProtectedRoute.js` - Route guard
- `frontend/src/pages/RolesManagement.js` - Roles UI

### Documentation
- `RBAC_IMPLEMENTATION_COMPLETE.md` - Full backend docs
- `PHASE2_FRONTEND_GUIDE.md` - Frontend implementation guide
- `RBAC_EXTENSION_PLAN.md` - Original planning document
- `RBAC_QUICK_REFERENCE.md` - This file

---

## 🚨 Critical Notes

1. **Enum Value Mapping**: SQLAlchemy requires `values_callable` for proper enum mapping
2. **Backward Compatibility**: All existing roles (6) preserved and working
3. **Additive Only**: Zero refactoring of existing code
4. **Test First**: Always test with different role accounts
5. **Permission Names**: Must match exactly between frontend and backend
6. **Own Data Logic**: Driver, Promoter, Anchor, Vendor, Client see only assigned data

---

## 🔍 Debugging Tips

### Backend Not Starting
```bash
# Check logs
docker compose logs backend

# Common issue: Import errors
# Solution: Verify all new files are in correct directories
```

### Login Fails
```bash
# Test directly
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"Admin@2026"}'

# Should return JWT token
```

### Permissions Not Working
```bash
# Verify permissions API
curl http://localhost:8001/api/v1/roles/permissions

# Check if role exists
curl http://localhost:8001/api/v1/roles/all
```

### Database Issues
```sql
-- Check users table
SELECT id, email, role FROM users;

-- Verify ENUM values
SHOW COLUMNS FROM users WHERE Field = 'role';
```

---

## 📞 Quick Commands

```bash
# Restart backend
docker compose restart backend

# View backend logs
docker compose logs -f backend

# Test admin login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"Admin@2026"}'

# Get all roles
curl http://localhost:8001/api/v1/roles/all

# Get permissions
curl http://localhost:8001/api/v1/roles/permissions

# Access database
docker compose exec db mysql -u ops360_user -p ops360_db
```

---

## ✅ Verification Checklist

Before starting Phase 2, verify:
- [ ] Backend starts without errors
- [ ] Admin login works
- [ ] All 14 roles returned by `/roles/all`
- [ ] Permissions API returns full matrix
- [ ] Menu API returns role-specific menus
- [ ] Test accounts exist for all new roles
- [ ] Database has all 14 ENUM values

---

**Version**: 1.0  
**Last Updated**: 2026-01-10  
**Status**: Phase 1 Complete ✅

Print this card and keep it handy during Phase 2 implementation! 📋
