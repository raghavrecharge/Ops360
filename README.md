# Fleet Operations Management Platform

## 🚀 Enterprise-Grade SaaS Platform for Fleet & Campaign Operations

### Overview

Production-ready full-stack platform that replaces Excel-based fleet operations workflows with an integrated system for managing clients, projects, campaigns, vendors, vehicles, drivers, and comprehensive reporting.

### 🏗️ Architecture

```
fleet-ops-platform/
├── backend/          # FastAPI backend with layered architecture
├── frontend/         # React SPA with modern UI
├── ml-service/       # FAISS RAG-powered AI insights
├── docker/           # Docker configurations
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

### 🛠️ Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- MongoDB (Database)
- JWT Authentication
- Role-Based Access Control (RBAC)
- Pydantic (Data Validation)
- Motor (Async MongoDB Driver)

**Frontend:**
- React 19
- React Router v6
- TanStack Query
- Tailwind CSS
- Shadcn/UI Components
- Axios

**ML/AI:**
- FAISS Vector Database
- Sentence Transformers
- RAG (Retrieval Augmented Generation)
- OpenAI Integration Ready

### 📊 Features

#### Core Modules
1. **Dashboard** - Real-time KPI metrics and quick actions
2. **Clients** - Client relationship management
3. **Projects** - Project portfolio management
4. **Campaigns** - Campaign lifecycle management (L-Shape, BTL, Roadshow)
5. **Vendors** - Vendor partnership management
6. **Vehicles** - Fleet vehicle tracking
7. **Drivers** - Driver database and performance
8. **Promoters/Anchors** - Field staff management
9. **Operations** - Live execution monitoring
10. **Expenses** - Expense tracking and approval
11. **Reports** - Daily execution reports with GPS/photos
12. **Accounts & Payments** - Payment processing
13. **Analytics** - Performance insights and trends
14. **Settings** - System configuration

#### Advanced Features
- **Role-Based Access Control** - Admin, Client Servicing, Operations Manager, Accounts, Vendor, Client
- **AI-Powered Insights** - RAG-based campaign analysis and recommendations
- **Document Validity Tracking** - RC, Insurance, License monitoring
- **GPS Integration Ready** - Vehicle tracking support
- **Photo Verification** - Campaign execution validation

### 🚀 Quick Start

#### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn

#### Installation

1. **Clone & Setup Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

2. **Setup Frontend**
```bash
cd frontend
yarn install
cp .env.example .env
# Edit .env with backend URL
```

3. **Setup ML Service**
```bash
cd ml-service
pip install -r requirements.txt
```

4. **Start Services**
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
yarn start

# Terminal 3 - ML Service (Optional)
cd ml-service
uvicorn app.main:app --reload --port 8002
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs
- ML Service: http://localhost:8002

### 📝 Default Credentials

Create admin user via API:
```bash
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fleetops.com",
    "name": "Admin User",
    "password": "admin123",
    "role": "admin"
  }'
```

Then login with:
- Email: admin@fleetops.com
- Password: admin123

### 🏗️ Backend Architecture

```
backend/app/
├── core/           # Configuration, security, permissions
├── database/       # MongoDB connection
├── models/         # (Reserved for SQLAlchemy if migrating to SQL)
├── schemas/        # Pydantic DTOs
├── repositories/   # Data access layer
├── services/       # Business logic layer
├── api/v1/         # API endpoints
└── utils/          # Helper functions
```

**Design Patterns:**
- Repository Pattern (Data Access)
- Service Layer (Business Logic)
- Dependency Injection
- Clean Architecture Principles

### 🔐 Security

- JWT-based authentication
- Bcrypt password hashing
- Role-based permissions
- CORS configuration
- Input validation with Pydantic
- SQL injection protection (via Motor ODM)

### 📚 API Documentation

Interactive API documentation available at `/docs` (Swagger UI)

**Key Endpoints:**
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/dashboard/stats` - Dashboard metrics
- `GET /api/v1/clients` - List clients
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/reports` - Campaign reports

### 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test
```

### 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 📈 Scalability

- Async/await throughout backend
- Connection pooling
- Horizontal scaling ready
- Stateless API design
- Vector database for AI scaling

### 🔄 Development Workflow

1. Feature branches from `main`
2. Code review required
3. Automated testing
4. Staging deployment
5. Production deployment

### 📦 Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fleet_operations
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
CORS_ORIGINS=*
OPENAI_API_KEY=sk-...
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 🛣️ Roadmap

- [ ] Real-time WebSocket updates
- [ ] Advanced analytics dashboards
- [ ] Mobile app (React Native)
- [ ] PDF/Excel report generation
- [ ] Email notifications
- [ ] Multi-tenancy support
- [ ] Advanced ML insights

### 📄 License

Proprietary - All rights reserved

### 👥 Contributors

Developed by Fleet Operations Team

### 🆘 Support

For support, email support@fleetops.com or open an issue.

---

**Version:** 1.0.0  
**Last Updated:** December 2025


## 🔄 Recent Database Migration (v2.0.0)

### MongoDB → MySQL Migration Completed

The backend has been successfully migrated from MongoDB to MySQL with SQLAlchemy ORM. This provides:

✅ **Relational Data Integrity** - Foreign key constraints and referential integrity
✅ **Improved Query Performance** - Optimized SQL queries with eager loading
✅ **ACID Compliance** - Full transaction support
✅ **Enterprise-Grade** - Production-ready setup with health checks
✅ **Scalability** - Connection pooling and optimized indexes

### What Changed

- **Database**: MongoDB → MySQL 8.0
- **ORM**: Motor (async MongoDB) → SQLAlchemy + aiomysql
- **Query Language**: MongoDB queries → SQL (via SQLAlchemy)
- **Configuration**: `.env` updated with MySQL connection string

### Quick Start with Docker

```bash
# Clone and setup
git clone https://github.com/raghavrecharge/Ops360.git
cd Ops360

# Create .env file
cp .env.example .env
# Update DATABASE_URL, SECRET_KEY, and other configs

# Start services
docker-compose up -d

# Backend available at: http://localhost:8000
# API Docs: http://localhost:8000/docs
# PhpMyAdmin: http://localhost:8080
```

### Production Features Implemented

✨ **API Enhancements**:
- Full CRUD endpoints for all entities
- Input validation (Pydantic models)
- Proper error handling and HTTP status codes
- Pagination support (skip/limit parameters)
- Relationship eager loading (selectinload)
- Comprehensive logging

✨ **Security Hardening**:
- JWT authentication
- Role-based access control (RBAC)
- CORS middleware with configurable origins
- GZIP compression
- SQL injection protection via ORM
- Input validation and sanitization

✨ **Docker Optimization**:
- Alpine Linux images (minimal footprint)
- Health checks for all services
- Persistent volumes for data
- Environment-based configuration
- Service dependencies
- Isolated network

✨ **Performance**:
- Connection pooling (1000 max connections)
- Query optimization with selectinload
- Index-friendly queries
- GZIP response compression
- 256MB max allowed packet size

### Database Schema

Key tables: `users`, `clients`, `projects`, `vendors`, `vehicles`, `drivers`, `promoters`, `campaigns`, `expenses`, `reports`, `payments`

All tables include:
- `id` (primary key)
- `created_at`, `updated_at` (timestamps)
- `is_active` (soft delete support)

### Environment Variables

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=secretpassword
MYSQL_DATABASE=fleet_operations
MYSQL_USER=fleetuser
MYSQL_PASSWORD=fleetpass123
MYSQL_PORT=3306

# Backend Configuration
DATABASE_URL=mysql+aiomysql://fleetuser:fleetpass123@mysql:3306/fleet_operations
SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
LOG_LEVEL=INFO
ENVIRONMENT=production

# Service Ports
BACKEND_PORT=8000
PHPMYADMIN_PORT=8080
```

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

**CRUD Operations:**
- `/api/clients` - Client management
- `/api/projects` - Project management
- `/api/vehicles` - Vehicle management
- `/api/drivers` - Driver management
- `/api/vendors` - Vendor management
- `/api/campaigns` - Campaign management
- `/api/expenses` - Expense management
- `/api/reports` - Report management

**Analytics:**
- `GET /api/dashboard/stats` - Dashboard statistics

**Health:**
- `GET /health` - Service health check

### Next Steps

1. **Database Migrations** - Set up Alembic for schema versioning
2. **Testing** - Add comprehensive test suite
3. **CI/CD** - GitHub Actions for automated deployment
4. **Monitoring** - Implement APM and logging
5. **Caching** - Add Redis for performance

### Support & Issues

For issues related to the MySQL migration, please check:
- Database connection string in `.env`
- MySQL service health: `docker-compose ps`
- Logs: `docker-compose logs backend`

---

**Version**: 2.0.0 (MongoDB → MySQL Migration)
**Last Updated**: January 2026
