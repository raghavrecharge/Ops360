# Ops360 Fleet Operations - System Policies

**Last Updated:** January 7, 2026  
**Canonical Admin:** admin@fleet.com

---

## 🔒 Admin User Policy

### Single Admin Enforcement
**POLICY:** Only ONE admin user is allowed in the entire system at any time.

**Current Admin:**
- Email: `admin@fleet.com`
- User ID: 2
- Role: ADMIN

**Database Protection:**
- Database triggers enforce single admin rule
- Both INSERT and UPDATE operations are blocked if they would create a second admin
- Trigger names:
  - `prevent_multiple_admins` (BEFORE INSERT)
  - `prevent_admin_role_change` (BEFORE UPDATE)

**Error Message When Violated:**
```
"Only one ADMIN user is allowed in the system"
```

---

## 🔐 Authentication Requirements

### Mandatory Authentication
Authentication is **NEVER optional** for any API endpoint (except public registration/login).

**Authentication Flow:**
1. User provides email + password to `/api/v1/auth/login`
2. Backend verifies password against bcrypt hash in database
3. JWT token issued ONLY after successful password verification
4. All subsequent requests MUST include valid JWT token

**HTTP Status Codes:**
- `401 Unauthorized` - Missing or invalid JWT token (unauthenticated)
- `403 Forbidden` - Valid token but insufficient role permissions (authenticated but unauthorized)

**Security Implementation:**
- File: `backend/app/core/security.py`
- Password Verification: `verify_password(plain_password, hashed_password)`
- JWT Creation: `create_access_token(data)` - only called after password verification
- Token Validation: `get_current_user(token)` - raises 401 if invalid

**Order of Operations:**
1. First: Authentication (verify JWT → 401 if missing/invalid)
2. Then: Authorization (check role → 403 if wrong role)

---

## 🔑 Password Management Policy

### Centralized Password Control
Users **CANNOT** change their own passwords. All password operations are performed by the system administrator/database owner only.

**No Self-Service Password Changes:**
- No password change UI in frontend
- No password change API endpoints available to users
- UPDATE operations on users table with password field are REJECTED with HTTP 403

**Administrative Password Management:**
Only database administrators can set/update passwords through:
1. Direct database access (recommended for security)
2. Protected admin-only API endpoints (create user only)

**Database Support:**
- New column added: `password_hint` (VARCHAR 255)
- Purpose: Internal reference for administrator to track/identify passwords
- **Never used in authentication** - only for admin reference
- Login always uses `password_hash` column (bcrypt)

**Example Password Update (Admin Only):**
```sql
-- Set password hint for admin reference
UPDATE users 
SET password_hint = 'Standard company policy password 2026' 
WHERE email = 'user@example.com';

-- Update actual password (requires bcrypt hashing via application)
-- Must use backend code to generate hash
```

---

## 📊 RBAC Architecture

### Current Implementation
**Source of Truth:** `users.role` column (ENUM type)

**Available Roles:**
- `ADMIN` - Full system access
- `CLIENT` - Limited to client-specific data
- `OPERATIONS_MANAGER` - Operations and logistics
- `ACCOUNTS` - Financial data access
- `VENDOR` - Vendor management
- `CLIENT_SERVICING` - Client relationship management

### RBAC Tables Status
The following tables exist in the database but are **NOT currently used for authorization**:
- `roles` - 2 records (preserved for future use)
- `permissions` - Empty (preserved for future use)
- `role_permissions` - Empty (preserved for future use)
- `user_roles` - 1 record (preserved for future use)

**Why They're Kept:**
- Future-proofing for granular permission system
- Potential migration to full RBAC model
- No performance impact (not queried during authorization)

**Current Authorization Method:**
1. Role stored in `users.role` column
2. Role embedded in JWT token payload
3. Permission checking via `@Permission.require_roles()` decorator
4. No database joins required for authorization

---

## 🛣️ API Routing Policy

### Canonical API Path
**POLICY:** All API endpoints MUST use `/api/v1` prefix

**Valid Paths:**
- ✅ `/api/v1/auth/login`
- ✅ `/api/v1/users`
- ✅ `/api/v1/clients`
- ✅ `/api/v1/projects`
- ✅ `/api/v1/campaigns`
- ✅ `/api/v1/expenses`
- ✅ (all other endpoints under `/api/v1`)

**Invalid Paths:**
- ❌ `/api/auth/login` - Returns 404
- ❌ `/auth/login` - Returns 404
- ❌ Any path without `/api/v1` prefix

**Enforcement:**
- Backend: FastAPI router configuration in `app/api/v1/__init__.py`
- Frontend: All API calls configured to use `/api/v1` base URL

---

## 🗄️ Database Integrity

### Current State
- **Total Tables:** 19
- **Total Users:** 7 (after duplicate removal)
- **Admin Users:** 1 (enforced by database trigger)
- **Orphaned Records:** 0
- **Foreign Key Violations:** 0

### Data Quality Rules
1. All users must have valid email (UNIQUE constraint)
2. All users must have password_hash (NOT NULL)
3. All users must have assigned role
4. Only one ADMIN user allowed (database trigger)
5. is_active flag must be set (defaults to true)

### Referential Integrity
All foreign keys are properly maintained:
- Projects → Clients (client_id)
- Campaigns → Projects (project_id)
- Expenses → Campaigns/Projects (campaign_id, project_id)
- No orphaned records exist in system

---

## 🔍 Access Control Verification

### Admin Access (ADMIN Role)
✅ Full access to all endpoints
- GET/POST/PUT/DELETE on `/api/v1/users`
- GET/POST/PUT/DELETE on `/api/v1/clients`
- Access to all dashboard/analytics endpoints
- Can create/modify/delete any resource

### Client Access (CLIENT Role)
✅ Limited access to own data
- ❌ Cannot access `/api/v1/users` (HTTP 403)
- ✅ Can access `/api/v1/auth/me` (own profile)
- ✅ Can access assigned projects/campaigns
- ❌ Cannot access admin dashboards

### Operations Manager (OPERATIONS_MANAGER Role)
✅ Operations and logistics access
- Can manage drivers, vehicles, routes
- Can view campaigns and projects
- ❌ Cannot manage users
- ❌ Cannot access financial reports

---

## 📋 System Administration Guide

### Setting User Password (Admin Task)
```bash
# Connect to database
docker exec -it fleet_mysql mysql -u root -psecretpassword fleet_operations

# Generate hash using Python (bcrypt)
python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('NewPassword123!'))"

# Update password in database
UPDATE users 
SET password_hash = '<bcrypt_hash_from_above>',
    password_hint = 'Company standard password Jan 2026'
WHERE email = 'user@example.com';
```

### Creating New User (Admin Only)
Use the API endpoint `/api/v1/auth/register` or admin panel with ADMIN credentials.

Password will be set by admin and communicated to user securely (out-of-band).

### Checking System Health
```bash
# Verify single admin
docker exec fleet_mysql mysql -u fleetuser -pfleetpass123 fleet_operations -e "SELECT COUNT(*) as admin_count FROM users WHERE role = 'ADMIN';"
# Should return: 1

# Check triggers
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "SHOW TRIGGERS LIKE 'users';"
# Should show: prevent_multiple_admins, prevent_admin_role_change

# Test authentication
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"<admin_password>"}'
# Should return JWT token
```

---

## 🚀 Future Enhancements

### Planned Features
1. **Granular RBAC**: Populate `permissions` and `role_permissions` tables
2. **Audit Logging**: Track all admin actions and password changes
3. **Password Expiry**: Force password rotation every 90 days
4. **Multi-Factor Authentication**: Add 2FA for admin accounts
5. **Role Hierarchies**: Implement role inheritance

### Migration Path
When implementing full RBAC:
1. Populate `permissions` table with granular permissions
2. Map roles to permissions in `role_permissions`
3. Update `Permission.require_roles()` to check permission tables
4. Keep `users.role` as primary role identifier
5. Use join tables for permission resolution

---

## ✅ Compliance Checklist

- [x] Single admin enforced (database trigger)
- [x] Authentication mandatory for all protected endpoints
- [x] No self-service password changes
- [x] Password hint column added for admin reference
- [x] RBAC tables preserved for future use
- [x] Database integrity verified (no orphans)
- [x] Access control tested (401/403 working correctly)
- [x] Canonical API path `/api/v1` enforced
- [x] All foreign keys valid
- [x] User roles properly mapped

---

**Document Owner:** System Administrator  
**Review Frequency:** Quarterly  
**Next Review:** April 7, 2026
