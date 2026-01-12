# AstroOS - Product Requirements Document

## Original Problem Statement
Build a production-ready web application "AstroOS" that combines full Parashara's Light feature parity and Align27-style daily timing UX. The system includes a Knowledge-Base RAG system using provided sample KB formats.

## Architecture
- **Frontend**: React with Tailwind-style CSS, Recharts for graphs, Radix UI components
- **Backend**: FastAPI + Python 3.11
- **Database**: MySQL 8 / MariaDB with Alembic migrations (SQLite fallback for dev)
- **Authentication**: JWT (access + refresh tokens)
- **Astrology Engine**: PySwisseph with Lahiri Ayanamsa
- **LLM Integration**: OpenAI GPT-4o-mini + text-embedding-3-small via Emergent Universal Key
- **Vector DB**: FAISS for embeddings

## Completed Batches

### ✅ Batch 1: Foundation (COMPLETE)
- Full database schema (24 tables) with Alembic migrations
- Demo user seeding and authentication
- Health endpoint and status verification
- Makefile with verification targets

### ✅ Batch 2: Astrology Workspace (COMPLETE)
- Charts API: D1-D60 divisional charts
- Dashas API: 5 systems (Vimshottari, Yogini, Ashtottari, Kala Chakra, Chara)
- 5-level Vimshottari dasha drill-down
- Transits API with Sade Sati detection
- PDF Export functionality
- North Indian chart visualization

### ✅ Batch 3: Advanced Modules (COMPLETE)
1. **Ashtakavarga** - BAV, SAV, Summary
2. **Yoga Detection** - 40+ yogas with categories
3. **Strength Systems** - Shadbala (6-fold strength)
4. **Varshaphala** - Annual charts, Tajika yogas
5. **Compatibility** - Ashtakoot (36 points), Manglik
6. **Remedies** - Gemstones, Mantras, Charity, Fasting

### ✅ Batch 4: Align27 Features (COMPLETE)
- Daily Cosmic Traffic Light (Green/Amber/Red scores)
- Moments (Golden/Productive/Silence) with timeline graph
- 90-Day Planner with filters (Only Green, Has Golden Moments)
- Day drawer with score, moments, rituals
- ICS Calendar Export (Today, Selected Day, Custom Range)

### ✅ Batch 5: RAG + ML (COMPLETE - Jan 5, 2026)

**Knowledge Base System:**
- File upload UI for PDF, JSON, TXT (25MB per file, 200 files per account)
- Async ingestion with progress tracking
- Text extraction and chunking (1000 chars with 200 overlap)
- FAISS vector search with OpenAI text-embedding-3-small
- Search UI with relevance-scored results

**Chat with RAG:**
- GPT-4o-mini powered chat via Emergent Universal Key
- Multi-turn conversations with session management
- Citation support with source references
- Topic coverage: Vedic concepts, yogas, doshas, remedies, interpretation

**ML Life Event Classifier:**
- 5 event labels: marriage, job_change, health_issue, foreign_travel, property_purchase
- 48 astrological features (planet positions, strengths, dashas, transits, SAV)
- LightGBM multi-output classifier with scikit-learn
- Training example submission UI
- Probability predictions with top factors

## API Endpoints Summary

### Batch 1 & 2
- `POST /api/demo/setup` - Demo data
- `POST /api/auth/login` - Authentication
- `GET /api/profiles` - Profiles
- `GET /api/charts/{id}/bundle` - Charts
- `GET /api/dashas/{id}` - Dashas
- `GET /api/transits/today/{id}` - Transits

### Batch 3
- `GET /api/ashtakavarga/{id}/bav|sav|summary`
- `GET /api/yogas/{id}`
- `GET /api/strength/{id}/shadbala|summary`
- `GET /api/varshaphala/{id}/{year}`
- `GET /api/compatibility/{id1}/{id2}`
- `GET /api/remedies/{id}`

### Batch 4
- `GET /api/align27/day|moments|planner|rituals|ics|today`

### Batch 5 (NEW)
- `GET /api/kb/stats` - KB statistics
- `GET /api/kb/sources` - List sources
- `POST /api/kb/upload` - Upload file
- `GET /api/kb/sources/{id}/progress` - Ingestion progress
- `POST /api/kb/search` - Vector search
- `DELETE /api/kb/sources/{id}` - Delete source
- `GET /api/chat/sessions` - List sessions
- `POST /api/chat/sessions` - Create session
- `POST /api/chat/ask` - RAG chat
- `GET /api/chat/sessions/{id}/history` - Chat history
- `GET /api/ml/stats` - Training stats
- `GET /api/ml/event-labels` - Available labels
- `POST /api/ml/extract-features` - Extract features from profile
- `POST /api/ml/training-examples` - Add training example
- `POST /api/ml/train` - Train model
- `POST /api/ml/predict` - Run prediction

## Frontend Tabs (15 total)
1. 🌟 Today - Cosmic Traffic Light, Timeline, Moments
2. 📅 Planner - 90-day forecast with filters
3. Charts - North Indian D1-D60
4. Dashas - 5 systems, drill-down
5. Transits - Current positions, Sade Sati
6. Ashtakavarga - BAV, SAV grids
7. Yogas - Detected combinations
8. Strength - Shadbala analysis
9. Varshaphala - Annual charts
10. Compatibility - Ashtakoot matching
11. Remedies - Gemstones, mantras
12. 📚 Knowledge - KB upload & search
13. 💬 Chat - RAG assistant
14. 🧠 Predictions - ML classifier
15. Export - PDF reports

## Test Coverage
- Backend smoke tests: All Batches 1-5 passing
- pytest: 13 Batch 5 API tests passing
- Frontend: All 15 tabs verified

## Demo Credentials
- Email: demo@astroos.com
- Password: demo123

## Files of Reference
- `/app/frontend/src/components/Workspace.js` - Main UI (15 tabs)
- `/app/frontend/src/components/KnowledgeBase.js` - KB UI
- `/app/frontend/src/components/AstroChat.js` - Chat UI
- `/app/frontend/src/components/MLPredictions.js` - ML UI
- `/app/backend/app/api/kb.py` - KB APIs
- `/app/backend/app/api/chat.py` - Chat APIs
- `/app/backend/app/api/ml.py` - ML APIs
- `/app/backend/app/modules/llm/provider.py` - OpenAI integration
- `/app/backend/app/modules/kb/` - KB services
- `/app/backend/app/modules/ml/life_event_classifier.py` - ML classifier

## Environment Variables
```
EMERGENT_LLM_KEY=sk-emergent-... (OpenAI via Emergent)
DATABASE_URL=mysql+pymysql://...
USE_SQLITE=true (for dev)
SECRET_KEY=...
```

## Known Constraints
- SQLite used in dev environment (MySQL/MariaDB for production)
- Chat RAG requires uploaded KB content for context
- ML predictions require trained model (min 5 examples)
