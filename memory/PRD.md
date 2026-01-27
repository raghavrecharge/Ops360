# Fleet Operations Management Platform - PRD

## Original Problem Statement
Build a production-ready Fleet, Campaign & Event Operations Management Platform to replace existing Excel-based workflows. The platform should provide a single admin dashboard to manage Clients, Projects, Campaigns, Vendors, Vehicles, Drivers, Execution, Expenses, Reports, and Payments.

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy ORM, MySQL (MariaDB)
- **Frontend:** React with Shadcn UI components
- **Database:** MySQL (fleet_operations)
- **Authentication:** JWT-based authentication

## User Personas
- **Admin:** Full access to all modules
- **Operations Manager:** Manage drivers, vehicles, campaigns
- **Client Servicing:** Client and project management
- **Accounts:** Expense and payment management
- **Vendor:** Limited vendor-specific access
- **Client:** Limited client-specific access

## Core Requirements
1. ✅ Authentication system (login, register, JWT tokens)
2. ✅ Dashboard with KPI cards and stats
3. ✅ Driver management with full CRUD operations
4. ⏳ Client management
5. ⏳ Project management
6. ⏳ Campaign management
7. ⏳ Vendor management
8. ⏳ Vehicle management
9. ⏳ Expense management
10. ⏳ Report generation

## What's Been Implemented

### January 27, 2026
- **MySQL Database Setup:** Configured MariaDB, created fleet_operations database
- **Backend API:** Complete FastAPI backend with layered architecture
- **Driver CRUD (Priority):** Full implementation including:
  - Create driver with all fields (name, phone, email, license, address, emergency contact)
  - List all drivers with vendor filtering
  - Get driver details
  - Update driver information
  - Soft delete driver
  - Assign vehicle to driver endpoint
- **Frontend Drivers Page:** Complete UI with:
  - Stats cards (Total Drivers, With Vehicles, License Expiring, License Expired)
  - Driver cards with edit/view/delete actions
  - Add Driver dialog with all form fields
  - View Driver details dialog
  - Edit Driver dialog
  - Delete confirmation dialog
  - License expiry warnings (visual indicators for expired/expiring soon)
- **Error Handling:** Fixed validation error toast display

### Database Schema - Drivers Table
```sql
CREATE TABLE drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  license_number VARCHAR(100),
  license_validity DATE,
  address VARCHAR(500),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  vendor_id INT REFERENCES vendors(id),
  assigned_vehicle_id INT REFERENCES vehicles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  updated_at DATETIME
);
```

## API Endpoints

### Authentication
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - Login and get token
- GET /api/v1/auth/me - Get current user

### Drivers (Fully Implemented)
- POST /api/v1/drivers - Create driver
- GET /api/v1/drivers - List all drivers (with optional vendor_id filter)
- GET /api/v1/drivers/{id} - Get driver details
- PUT /api/v1/drivers/{id} - Update driver
- DELETE /api/v1/drivers/{id} - Soft delete driver
- POST /api/v1/drivers/{driver_id}/assign-vehicle/{vehicle_id} - Assign vehicle

### Other Modules (Basic CRUD)
- /api/v1/clients
- /api/v1/projects
- /api/v1/campaigns
- /api/v1/vendors
- /api/v1/vehicles
- /api/v1/promoters
- /api/v1/expenses
- /api/v1/reports

## Testing Status
- Backend CRUD: 100% pass rate
- Frontend UI: 95% pass rate (fixed error handling issue)
- Test file: /app/backend/tests/test_drivers_crud.py

## Test Credentials
- Email: admin@fleetops.com
- Password: password123

## Prioritized Backlog

### P0 (High Priority)
- [ ] Complete frontend implementation for other modules (Clients, Projects, Campaigns, etc.)
- [ ] Implement full RBAC (Role-Based Access Control) across endpoints

### P1 (Medium Priority)
- [ ] Vehicle management with driver assignment
- [ ] Expense tracking and approval workflow
- [ ] Dashboard enhancements with charts

### P2 (Lower Priority)
- [ ] ML/RAG service implementation
- [ ] Report generation (PDF, Excel exports)
- [ ] Docker containerization
- [ ] React Native mobile app completion

## Known Issues
- Docker setup is inconsistent (using local MariaDB instead of container)
- React Native mobile app not built/tested yet

## File Structure
```
/app
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Config, security, permissions
│   │   ├── database/        # SQLAlchemy connection
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # Data access layer
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   └── tests/               # Pytest tests
├── frontend/
│   └── src/
│       ├── components/ui/   # Shadcn UI components
│       ├── lib/             # API client, utilities
│       └── pages/           # Page components
└── test_reports/            # Test results
```
