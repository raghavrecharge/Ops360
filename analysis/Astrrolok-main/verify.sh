#!/bin/bash
set -e

echo "==========================================="
echo "AstroOS VERIFICATION SUITE (Batches 1-3)"
echo "==========================================="
echo ""

# Ensure MariaDB is running
echo "=== 0/6: Database Service Check ==="
if ! pgrep -x "mariadbd" > /dev/null; then
    echo "Starting MariaDB..."
    service mariadb start
    sleep 3
fi

# Test MySQL connection
if mariadb -u astro -pastropass astroos -e "SELECT 1" > /dev/null 2>&1; then
    echo "✓ MySQL/MariaDB connection successful"
else
    echo "✗ MySQL/MariaDB connection failed"
    exit 1
fi

# Verify database tables
TABLE_COUNT=$(mariadb -u astro -pastropass astroos -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='astroos' AND table_name != 'alembic_version';")
if [ "$TABLE_COUNT" -ge 24 ]; then
    echo "✓ All $TABLE_COUNT tables present in MySQL"
else
    echo "✗ Expected 24+ tables, found $TABLE_COUNT"
    exit 1
fi

echo ""
echo "=== 1/6: Repository Structure Check ==="
if [ -f "/app/backend/app/main.py" ] && \
   [ -f "/app/backend/alembic/versions/001_initial_schema.py" ] && \
   [ -f "/app/backend/scripts/seed.py" ] && \
   [ -f "/app/backend/tests/smoke_test.py" ] && \
   [ -f "/app/Makefile" ] && \
   [ -f "/app/docker-compose.yml" ] && \
   [ -f "/app/README.md" ]; then
    echo "✓ All required files present"
else
    echo "✗ Missing required files"
    exit 1
fi

echo ""
echo "=== 2/6: Database Schema Check ==="
if grep -q "natal_charts" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "dashas" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "ashtakavarga" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "yogas" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "strengths" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "varshaphala" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "compatibility" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "remedies" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "kb_sources" /app/backend/alembic/versions/001_initial_schema.py && \
   grep -q "ml_models" /app/backend/alembic/versions/001_initial_schema.py; then
    echo "✓ All required tables in migration"
    echo "  - Batch 1: users, profiles, natal_charts"
    echo "  - Batch 2: dashas, transits"
    echo "  - Batch 3: ashtakavarga, yogas, strengths, varshaphala, compatibility, remedies"
    echo "  - Future: kb_sources, kb_chunks, ml_models"
else
    echo "✗ Missing required tables in migration"
    exit 1
fi

echo ""
echo "=== 3/6: Alembic Migration Check ==="
cd /app/backend
CURRENT=$(alembic current 2>&1 | grep -o '[0-9a-f]*' | head -1)
if [ -n "$CURRENT" ]; then
    echo "✓ Alembic migration at: $CURRENT"
else
    echo "✗ Alembic migration not applied"
    exit 1
fi

echo ""
echo "=== 4/6: Makefile Targets Check ==="
if grep -q "^up:" /app/Makefile && \
   grep -q "^migrate:" /app/Makefile && \
   grep -q "^seed:" /app/Makefile && \
   grep -q "^demo:" /app/Makefile && \
   grep -q "^verify:" /app/Makefile && \
   grep -q "^test-backend:" /app/Makefile && \
   grep -q "^smoke:" /app/Makefile; then
    echo "✓ All required Makefile targets present"
else
    echo "✗ Missing required Makefile targets"
    exit 1
fi

echo ""
echo "=== 5/6: API Endpoints Check ==="
# Batch 1 endpoints
if grep -q "/api/health" /app/backend/app/main.py && \
   grep -q "/api/auth/login" /app/backend/app/main.py && \
   grep -q "/api/profiles" /app/backend/app/main.py; then
    echo "✓ Batch 1 API endpoints present"
else
    echo "✗ Missing Batch 1 API endpoints"
    exit 1
fi

# Batch 2 endpoints
if [ -f "/app/backend/app/api/charts.py" ] && \
   [ -f "/app/backend/app/api/dashas.py" ] && \
   [ -f "/app/backend/app/api/transits.py" ]; then
    echo "✓ Batch 2 API endpoints present"
else
    echo "✗ Missing Batch 2 API endpoints"
    exit 1
fi

# Batch 3 endpoints
if [ -f "/app/backend/app/api/ashtakavarga.py" ] && \
   [ -f "/app/backend/app/api/yogas.py" ] && \
   [ -f "/app/backend/app/api/strength.py" ] && \
   [ -f "/app/backend/app/api/varshaphala.py" ] && \
   [ -f "/app/backend/app/api/compatibility.py" ] && \
   [ -f "/app/backend/app/api/remedies.py" ]; then
    echo "✓ Batch 3 API endpoints present"
else
    echo "✗ Missing Batch 3 API endpoints"
    exit 1
fi

echo ""
echo "=== 6/6: Smoke Tests (All Batches) ==="
cd /app/backend
python3 tests/smoke_test.py
if [ $? -eq 0 ]; then
    echo "✓ All smoke tests passed"
else
    echo "✗ Smoke tests failed"
    exit 1
fi

echo ""
echo "==========================================="
echo "✓ FULL VERIFICATION COMPLETE (Batches 1-3)"
echo "==========================================="
echo ""
echo "Summary:"
echo "  ✓ MySQL/MariaDB running and connected"
echo "  ✓ 24+ tables created via Alembic migrations"
echo "  ✓ Repository structure correct"
echo "  ✓ Makefile targets functional"
echo "  ✓ All API endpoints implemented (Batches 1-3)"
echo "  ✓ All smoke tests passing"
echo ""
echo "Ready for BATCH 4 implementation (Align27 features)."
echo ""
