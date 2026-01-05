# 🚀 Ops360 Fleet Operations - Quick Start Guide

## Run the Application

This guide will help you get the Ops360 application running locally using Docker.

### Prerequisites

- **Docker** ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** (comes with Docker Desktop)
- **Git** (to clone the repository)
- **4GB RAM** minimum for MySQL + Backend

### Step 1: Clone the Repository

```bash
git clone https://github.com/raghavrecharge/Ops360.git
cd Ops360
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=secretpassword
MYSQL_DATABASE=fleet_operations
MYSQL_USER=fleetuser
MYSQL_PASSWORD=fleetpass123
MYSQL_PORT=3306

# Backend
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

### Step 3: Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- **MySQL Database** on `localhost:3306`
- **Backend API** on `http://localhost:8000`
- **PhpMyAdmin** on `http://localhost:8080`

### Step 4: Verify Services are Running

```bash
docker-compose ps
```

Expected output:
```
NAME          STATUS
fleet_mysql   Up 2 minutes (healthy)
fleet_backend Up 2 minutes
fleet_phpmyadmin Up 2 minutes
```

### Step 5: Access the Application

#### API Server
- **Base URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

#### Database Management
- **PhpMyAdmin**: http://localhost:8080
- **Username**: `fleetuser`
- **Password**: `fleetpass123`
- **Server**: `mysql`

### Step 6: Test the API

#### Register a User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"user@example.com\",
    \"name\": \"John Doe\",
    \"phone\": \"9876543210\",
    \"password\": \"Password123!\",
    \"role\": \"admin\"
  }"
```

#### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"user@example.com\",
    \"password\": \"Password123!\"
  }"
```

#### Get Dashboard Stats

```bash
curl -X GET "http://localhost:8000/api/dashboard/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Available Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

**CRUD Operations:**
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create new vehicle
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create new driver
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense

**Analytics:**
- `GET /api/dashboard/stats` - Dashboard statistics

### View API Documentation

Open your browser and visit:

```
http://localhost:8000/docs
```

This interactive Swagger UI allows you to:
- View all endpoints
- See request/response schemas
- Test endpoints directly
- Copy-paste curl commands

### Troubleshooting

**MySQL Connection Error:**
```bash
# Check MySQL service
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

**Backend Not Starting:**
```bash
# Check backend logs
docker-compose logs backend

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Database Already in Use:**
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Stop Services

```bash
# Stop all running containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Database Info

- **Type**: MySQL 8.0
- **Host**: `mysql` (or `localhost:3306` from host machine)
- **Database**: `fleet_operations`
- **User**: `fleetuser`
- **Password**: `fleetpass123` (from .env)

### Key Features

✅ Production-ready MySQL database
✅ Async FastAPI backend
✅ SQLAlchemy ORM with proper relationships
✅ JWT authentication
✅ Health checks on all services
✅ Comprehensive error handling
✅ Full CRUD operations
✅ Pagination support
✅ Interactive API documentation

### Next Steps

1. Create clients, projects, and campaigns via the API
2. Register users and test authentication
3. Explore the database in PhpMyAdmin
4. Review the complete API documentation at `/docs`
5. Check the [README.md](./README.md) for detailed migration information

### Support

For issues or questions:
1. Check docker-compose logs
2. Verify .env file configuration
3. Ensure Docker is running
4. Review the [README.md](./README.md) for migration details

---

**Version**: 2.0.0 (MySQL Edition)
**Last Updated**: January 2026
