# Astro Jyotish - Integrated Vedic Astrology Platform

A complete full-stack Vedic astrology application integrating **Jyotish-Ai** frontend with **Astrolok** backend.

## 🌟 Features

### Frontend (React + Vite + TypeScript)
- **Dashboard**: Personalized cosmic overview with Matrix Score
- **Panchang**: Daily Hindu calendar details
- **Charts**: D1-D60 divisional charts with North/South Indian styles
- **Dashas**: Vimshottari dasha periods with interactive tree
- **Ashtakavarga**: BAV/SAV point analysis
- **Strength (Shadbala)**: Six-fold planetary strength
- **Varshaphala**: Annual horoscope predictions
- **Compatibility**: Ashtakoot matching for relationships
- **Remedies**: Mantras, gemstones, charity recommendations
- **Knowledge Base**: Searchable Vedic astrology reference
- **AI Chat**: Oracle-based Q&A about your chart

### Backend (FastAPI + SQLAlchemy)
- **Authentication**: JWT-based login/register
- **Profiles**: Birth data management
- **Chart Calculations**: Accurate Vedic calculations
- **API Endpoints**: RESTful API for all features

## 🔌 API Mapping

| Frontend Function | Backend Endpoint |
|-------------------|------------------|
| `authService.login()` | `POST /api/auth/login` |
| `authService.register()` | `POST /api/auth/register` |
| `authService.setupDemo()` | `POST /api/demo/setup` |
| `profileService.getProfiles()` | `GET /api/profiles` |
| `astrologyApi.getChartBundle()` | `GET /api/charts/{id}/bundle` |
| `astrologyApi.getDashas()` | `GET /api/dashas/{id}` |
| `astrologyApi.getYogas()` | `GET /api/yogas/{id}` |
| `astrologyApi.getShadbala()` | `GET /api/strength/{id}` |
| `astrologyApi.getRemedies()` | `GET /api/remedies/{id}` |
| `astrologyApi.getAshtakavarga()` | `GET /api/ashtakavarga/{id}` |
| `astrologyApi.getTodayData()` | `GET /api/align27/day` |
| `astrologyApi.getPlannerData()` | `GET /api/align27/planner` |
| `astrologyApi.sendChatMessage()` | `POST /api/chat/ask` |
| `astrologyApi.searchKnowledge()` | `POST /api/kb/search` |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Yarn package manager

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
cd frontend
yarn install
cp .env.example .env
yarn start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Demo Account: demo@astroos.com / demo123

## 📁 Project Structure

```
/app/
├── backend/
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # SQLAlchemy models
│   │   └── modules/        # Astrology calculations
│   ├── server.py           # Entry point
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React UI components
│   │   ├── contexts/       # Auth context
│   │   ├── services/       # API service layer
│   │   │   ├── api.ts          # Axios config
│   │   │   ├── authService.ts  # Authentication
│   │   │   ├── profileService.ts
│   │   │   ├── astrologyApi.ts # Backend API calls
│   │   │   └── astrologyService.ts # Local fallback
│   │   ├── App.tsx
│   │   └── types.ts
│   ├── package.json
│   └── .env.example
│
└── docker-compose.yml
```

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:8001
```

### Backend (.env)
```env
USE_SQLITE=true
DATABASE_URL=sqlite:////app/backend/data/astroos.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=*
```

## 🧪 Demo Account

After starting the app:
- **Email**: demo@astroos.com
- **Password**: demo123

Or click "Try Demo Account" button on the login page.

## 📝 Integration Notes

1. **Authentication Flow**: JWT tokens stored in localStorage
2. **API Fallback**: If backend fails, local calculations are used
3. **CORS**: Backend allows all origins for development
4. **Chat API**: Uses `/api/chat/ask` endpoint

## License

Proprietary - All rights reserved.
