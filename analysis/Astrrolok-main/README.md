# AstroOS

Complete Vedic Astrology Platform with Parashara's Light and Align27 features.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Make

### Demo Setup (Fastest)

```bash
make demo
```

This will:
1. Build and start all services (MySQL, Redis, Backend, Frontend)
2. Run database migrations
3. Seed demo data

Access the app at http://localhost:3000

Demo credentials:
- Email: demo@astroos.com
- Password: demo123

### Manual Setup

```bash
# Start services
make up

# Run migrations
make migrate

# Seed demo data
make seed
```

### Verification

Run complete verification suite:

```bash
make verify
```

This runs:
1. Database migration up/down test
2. Backend unit tests
3. Frontend build
4. Seed demo data
5. API smoke tests

## Available Commands

```bash
make up          # Start all services
make down        # Stop all services
make logs        # View logs
make migrate     # Run database migrations
make seed        # Seed demo data
make demo        # Complete demo setup
make test-backend    # Run backend tests
make test-frontend   # Build frontend
make smoke       # Run API smoke tests
make verify      # Run full verification suite
make clean       # Clean up containers and volumes
```

## Architecture

### Backend (FastAPI + Python)
- Swiss Ephemeris for accurate calculations
- Complete chart calculations (D1-D60)
- 5-level Vimshottari Dasha (MD/AD/PD/SD/Pran)
- Multiple Dasha systems (Yogini, Chara, Ashtottari, Kala Chakra)
- Ashtakavarga (BAV + SAV)
- Yoga detection with rule engine
- Varshaphala (Annual charts)
- Compatibility analysis
- Align27 daily scoring and moments
- RAG with FAISS and OpenAI embeddings
- ML predictions with LightGBM

### Frontend (React + TypeScript)
- Modern UI with premium design
- Dashboard for Align27 features
- Chart viewers
- Dasha timelines
- Knowledge base chat
- Multi-profile management

### Database (MySQL)
- Complete schema with Alembic migrations
- Proper indexing and constraints
- Audit logging

## API Documentation

Once running, access:
- API docs: http://localhost:8001/docs
- Health check: http://localhost:8001/api/health

## Testing

### Backend Tests
```bash
make test-backend
```

Tests include:
- Vimshottari 5-level dasha calculations
- Ashtakavarga matrix shapes and invariants
- Align27 day scores and moments

### Smoke Tests
```bash
make smoke
```

Tests:
- Health endpoint
- Demo setup
- Authentication
- Profile CRUD

## Environment Variables

Create `.env` file in root:

```bash
OPENAI_API_KEY=your_key_here
```

## Development

### Hot Reload

Both backend and frontend have hot reload enabled.

### View Logs
```bash
make logs
```

### Database Access
```bash
docker-compose exec mysql mysql -u astro -p astroos
# Password: astropass
```

## Production Deployment

1. Update environment variables in docker-compose.yml
2. Change SECRET_KEY
3. Use production OpenAI key
4. Configure proper CORS origins
5. Set up SSL/TLS

## Troubleshooting

### Services not starting
```bash
make down
make clean
make up
```

### Migration errors
```bash
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head
```

### View backend logs
```bash
docker-compose logs backend
```

## License

Proprietary - All rights reserved
