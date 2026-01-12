.PHONY: up down logs migrate seed demo test-backend test-frontend smoke verify clean db-start db-stop

up:
	@echo "Starting AstroOS..."
	docker-compose up --build -d
	@echo "Waiting for services to be ready..."
	@sleep 15

down:
	@echo "Stopping AstroOS..."
	docker-compose down

logs:
	docker-compose logs -f

# Database (local development without Docker)
db-start:
	@service mariadb start || echo "MariaDB already running"
	@sleep 2
	@mariadb -e "SELECT 1" > /dev/null && echo "✓ MariaDB ready"

db-stop:
	@service mariadb stop || echo "MariaDB not running"

migrate:
	cd backend && alembic upgrade head
	@echo "✓ Migrations applied"

seed:
	@echo "Seeding demo data..."
	docker-compose exec backend python scripts/seed.py

demo: up
	@echo "Setting up demo environment..."
	@sleep 20
	@$(MAKE) migrate
	@$(MAKE) seed
	@echo "\n✅ Demo setup complete!"
	@echo "Access the app at http://localhost:3000"
	@echo "Demo credentials: demo@astroos.com / demo123"

test-backend:
	@echo "Running backend tests..."
	docker-compose exec backend pytest tests/test_dasha.py tests/test_ashtakavarga.py tests/test_align27.py -v

test-frontend:
	@echo "Building frontend..."
	docker-compose exec frontend yarn build

smoke:
	@echo "Running API smoke tests..."
	docker-compose exec backend python tests/smoke_test.py

verify:
	@chmod +x /app/verify.sh
	@/app/verify.sh

clean:
	docker-compose down -v
	rm -rf backend/__pycache__ backend/.pytest_cache
	@echo "✅ Cleaned up"
