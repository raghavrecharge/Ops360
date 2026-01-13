# Role-Based Access Control (RBAC) Extension Plan

## Current Roles (Existing - DO NOT MODIFY)
- ✅ ADMIN - Full system access
- ✅ CLIENT_SERVICING - Client relationship management
- ✅ OPERATIONS_MANAGER - Operations and logistics
- ✅ ACCOUNTS - Financial data access
- ✅ VENDOR - Vendor management
- ✅ CLIENT - View reports only

## New Roles to Add
- 🆕 SALES - Project creation, client details, vendor selection
- 🆕 PURCHASE - Budget confirmation, vendor costing
- 🆕 OPERATOR - Coordination of vans, vendors, drivers (Ops Lead)
- 🆕 DRIVER - Vehicle movement, GPS, KM tracking, expenses
- 🆕 PROMOTER - Activity data, footfall, photos
- 🆕 ANCHOR - Campaign hosting confirmation
- 🆕 VEHICLE_MANAGER - Vehicle health and documents
- 🆕 GODOWN_MANAGER - Inventory movement

## Responsibilities Matrix

### ADMIN
- Full system access
- User management
- Settings configuration
- All CRUD operations

### SALES
- **Create/View/Edit:**
  - Clients
  - Projects
  - Vendor selection
- **Read-Only:**
  - Campaigns
  - Reports
- **No Access:**
  - User management
  - Expenses approval
  - Driver/Vehicle management

### PURCHASE
- **Create/View/Edit:**
  - Vendors
  - Budget/Costing
  - Purchase orders
- **Read-Only:**
  - Projects
  - Campaigns
- **No Access:**
  - Client creation
  - User management

### CLIENT_SERVICING (Existing)
- **Create/View/Edit:**
  - Projects
  - Campaigns
  - Reports
  - Assign operations team
- **Read-Only:**
  - Clients
  - Vendors
  - Vehicles
- **No Access:**
  - User management
  - Financial approvals

### OPERATIONS_MANAGER (Existing)
- **Create/View/Edit:**
  - Campaigns
  - Operations
  - Driver assignments
  - Vehicle assignments
- **Read-Only:**
  - Projects
  - Clients
  - Expenses
- **No Access:**
  - User management
  - Financial approvals

### OPERATOR (Ops Lead)
- **Create/View/Edit:**
  - Campaign execution
  - Driver coordination
  - Vehicle coordination
  - Vendor coordination
- **Read-Only:**
  - Projects
  - Campaigns
- **No Access:**
  - Project creation
  - Financial data

### DRIVER
- **Create/View:**
  - Own vehicle movements
  - GPS tracking
  - KM tracking
  - Own expenses
- **Read-Only:**
  - Assigned campaigns
- **No Access:**
  - Other drivers data
  - Financial approvals
  - Project/Client data

### PROMOTER
- **Create/View:**
  - Activity data
  - Footfall data
  - Photos/Media
  - Campaign reports
- **Read-Only:**
  - Assigned campaigns
- **No Access:**
  - Other promoters data
  - Financial data
  - Project/Client data

### ANCHOR
- **Create/View:**
  - Campaign hosting confirmation
  - Event schedules
  - Activity logs
- **Read-Only:**
  - Assigned campaigns
- **No Access:**
  - Financial data
  - Project/Client data

### VENDOR (Existing)
- **Create/View/Edit:**
  - Vehicles
  - Drivers
  - Invoices
- **Read-Only:**
  - Assigned campaigns
- **No Access:**
  - Other vendors data
  - Financial approvals

### VEHICLE_MANAGER
- **Create/View/Edit:**
  - Vehicles
  - Vehicle health
  - Documents
  - Maintenance
- **Read-Only:**
  - Drivers
  - Campaigns
- **No Access:**
  - Financial data
  - Client/Project data

### GODOWN_MANAGER
- **Create/View/Edit:**
  - Inventory
  - Stock movement
  - Material tracking
- **Read-Only:**
  - Campaigns
  - Projects
- **No Access:**
  - Financial data
  - User management

### ACCOUNTS (Existing)
- **Create/View/Edit:**
  - Expenses approval
  - Payments
  - Invoices
- **Read-Only:**
  - All projects
  - All campaigns
  - All vendors
- **No Access:**
  - Project creation
  - User management

### CLIENT (Existing)
- **Read-Only:**
  - Own projects
  - Own reports
  - Own campaigns
- **No Access:**
  - All other data
  - Any write operations

## API Permissions Matrix

| Endpoint | Admin | Sales | Purchase | CS | Ops Mgr | Operator | Driver | Promoter | Anchor | Vendor | Vehicle Mgr | Godown Mgr | Accounts | Client |
|----------|-------|-------|----------|----|---------|---------|------------|----------|--------|--------|-------------|------------|----------|--------|
| /users | RW | - | - | R | - | - | - | - | - | - | - | - | - | - |
| /clients | RW | RW | R | R | R | R | - | - | - | - | - | - | R | R |
| /projects | RW | RW | R | RW | R | R | - | - | - | - | - | R | R | R |
| /campaigns | RW | R | R | RW | RW | RW | R | R | R | R | R | R | R | R |
| /vendors | RW | R | RW | R | R | R | - | - | - | RW | R | R | R | - |
| /vehicles | RW | - | R | R | RW | RW | R | - | - | RW | RW | R | R | - |
| /drivers | RW | - | R | R | RW | RW | R | - | - | RW | R | R | R | - |
| /promoters | RW | - | - | R | RW | RW | - | R | - | - | - | - | R | - |
| /expenses | RW | R | R | R | R | R | RW | RW | RW | R | R | R | RW | - |
| /reports | RW | R | - | RW | R | R | - | R | - | - | - | - | R | R |
| /dashboard | R | R | R | R | R | R | R | R | R | R | R | R | R | R |
| /analytics | R | R | R | R | R | - | - | - | - | - | - | - | R | - |

**Legend:**
- RW = Read + Write (Full access)
- R = Read only
- - = No access

## Frontend Menu Visibility

### ADMIN
- Dashboard, Clients, Projects, Campaigns, Vendors, Vehicles, Drivers, Promoters, Operations, Expenses, Reports, Accounts, Analytics, Settings

### SALES
- Dashboard, Clients, Projects, Campaigns (view), Vendors (view), Reports

### PURCHASE
- Dashboard, Vendors, Projects (view), Campaigns (view)

### CLIENT_SERVICING
- Dashboard, Clients (view), Projects, Campaigns, Reports, Operations, Vendors (view), Vehicles (view)

### OPERATIONS_MANAGER
- Dashboard, Projects (view), Campaigns, Operations, Drivers, Vehicles, Promoters, Expenses (view)

### OPERATOR
- Dashboard, Campaigns, Operations, Drivers, Vehicles, Vendors (view)

### DRIVER
- Dashboard, My Trips, My Expenses, My Campaigns

### PROMOTER
- Dashboard, My Campaigns, My Reports, Upload Data

### ANCHOR
- Dashboard, My Events, My Campaigns

### VENDOR
- Dashboard, My Vehicles, My Drivers, My Invoices

### VEHICLE_MANAGER
- Dashboard, Vehicles, Drivers, Maintenance

### GODOWN_MANAGER
- Dashboard, Inventory, Stock Movement, Campaigns (view)

### ACCOUNTS
- Dashboard, Expenses, Payments, Reports, Projects (view), Campaigns (view), Vendors (view)

### CLIENT
- Dashboard, My Reports, My Projects, My Campaigns

## Implementation Steps

1. ✅ Update UserRole enum (add new roles)
2. ✅ Create comprehensive permissions matrix
3. ✅ Update Permission class with role-specific helpers
4. ✅ Update each API endpoint with correct role permissions
5. ✅ Update frontend Layout.js to conditionally render menu items
6. ✅ Create role-based routing guards
7. ✅ Update Settings → Roles/Permissions screen
8. ✅ Add database migration for new roles
9. ✅ Test all existing functionality (regression testing)
10. ✅ Test new roles

## Database Changes Required

```sql
-- Update UserRole enum to include new roles
ALTER TABLE users MODIFY COLUMN role ENUM(
  'admin',
  'client_servicing',
  'operations_manager',
  'accounts',
  'vendor',
  'client',
  'sales',
  'purchase',
  'operator',
  'driver',
  'promoter',
  'anchor',
  'vehicle_manager',
  'godown_manager'
) NOT NULL;
```

## Validation Checklist

- [ ] All existing roles work as before
- [ ] New roles can log in
- [ ] Unauthorized access returns 403
- [ ] Frontend menus match backend permissions
- [ ] No hardcoded role checks in UI
- [ ] Zero runtime errors
- [ ] All existing tests pass
- [ ] Permission-based logic throughout

## Summary

This extension adds 8 new roles while preserving all 6 existing roles and their functionality. The implementation is purely additive - no existing code is modified except to add new role checks where needed.
