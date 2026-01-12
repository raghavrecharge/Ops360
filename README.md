# Astro Jyotish - Full-Stack Vedic Astrology Platform

A complete Vedic astrology application integrating **Jyotish-Ai** frontend with **Astrolok** backend.

## 🌟 Features

- **Natal Charts**: D1 (Rasi), D9 (Navamsha), D10 (Dashamsha) divisional charts
- **Vimshottari Dasha**: Full Mahadasha, Antardasha, and Pratyantardasha periods
- **Yoga Detection**: 10+ Vedic yogas with detailed interpretations
- **Shadbala Strength**: Complete planetary strength analysis
- **Ashtakavarga**: SAV (Sarvashtakavarga) point calculations
- **Daily Predictions**: Align27-style today view with panchang
- **Activity Planner**: 90-day astrological calendar
- **Compatibility**: Ashtakoot matching for relationships
- **Remedies**: Planet-specific mantras, gemstones, and rituals
- **AI Chat**: Oracle-based Q&A about your chart
- **Knowledge Base**: Searchable Vedic astrology reference

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  AuthContext → Services Layer → Components → Views      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │ API Calls                       │
└────────────────────────────┼────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + SQLAlchemy)            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Auth → Profiles → Charts → Dashas → Yogas → AI Chat   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                     SQLite / MySQL                           │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd astrojyotish

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env

# Start development server
yarn start
```

## 📁 Project Structure

```
/app/
├── backend/                    # Astrolok Backend
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   ├── core/              # Config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── modules/           # Astrology calculations
│   │   │   ├── chart/         # Chart calculations
│   │   │   ├── dasha/         # Dasha calculations
│   │   │   └── ...
│   │   └── main.py            # FastAPI app entry
│   ├── server.py              # Server startup script
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # Jyotish-Ai Frontend
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── contexts/          # Auth context
│   │   ├── services/          # API service layer
│   │   │   ├── api.ts         # Axios config
│   │   │   ├── authService.ts # Authentication
│   │   │   └── astrologyApi.ts# Astrology API calls
│   │   ├── App.tsx            # Main app component
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
└── docker-compose.yml          # Multi-service orchestration
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/demo/setup` | Setup demo account |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | List user profiles |
| POST | `/api/profiles` | Create profile |
| GET | `/api/profiles/{id}` | Get profile details |

### Astrology
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/charts/{profile_id}` | Get natal chart |
| GET | `/api/charts/{profile_id}/bundle` | Get all divisional charts |
| GET | `/api/dashas/{profile_id}` | Get Vimshottari Dasha |
| GET | `/api/yogas/{profile_id}` | Detect yogas in chart |
| GET | `/api/strength/{profile_id}` | Get Shadbala strength |
| GET | `/api/ashtakavarga/{profile_id}` | Get SAV points |
| GET | `/api/remedies/{profile_id}` | Get remedies |

### Align27 Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/align27/today?profile_id=` | Today's summary |
| GET | `/api/align27/day?profile_id=&date=` | Day score |
| GET | `/api/align27/planner?profile_id=&start=&days=` | Activity planner |

### AI & Knowledge
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/messages` | AI chat message |
| GET | `/api/kb/search?q=` | Search knowledge base |

## 🔐 Environment Variables

### Backend (.env)
```env
USE_SQLITE=true
DATABASE_URL=sqlite:////app/data/astroos.db
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key  # For AI chat
CORS_ORIGINS=*
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:8001
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild specific service
docker compose up -d --build backend
```

## 🧪 Demo Account

After setup, a demo account is automatically available:
- **Email**: demo@astroos.com
- **Password**: demo123

Or click "Try Demo Account" on the login page.

## 📝 Development Notes

### Frontend API Integration
All API calls go through the centralized service layer:
- `services/api.ts` - Axios instance with interceptors
- `services/authService.ts` - Authentication handling
- `services/astrologyApi.ts` - All astrology API calls

### Authentication Flow
1. User logs in via `/api/auth/login`
2. JWT token stored in localStorage
3. Token added to all API requests via Axios interceptor
4. Auto-logout on 401 response

### Data Transformation
Backend responses are transformed in `astrologyApi.ts` to match frontend types.

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check Python version (requires 3.9+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend build errors
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### CORS issues
Ensure `CORS_ORIGINS=*` in backend `.env` for development.

## 📄 License

Proprietary - All rights reserved.

---

Built with ❤️ integrating Astrolok backend with Jyotish-Ai frontend.
