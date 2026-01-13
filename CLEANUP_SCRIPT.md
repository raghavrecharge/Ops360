# 🧹 DATABASE CLEANUP SCRIPT (OPTIONAL)

**⚠️ WARNING: Run this ONLY after team confirmation**

**Date**: 12 January 2026  
**Purpose**: Remove verified empty tables  
**Status**: All 4 tables confirmed empty (0 records)

---

## 📋 TABLES TO REMOVE

Based on audit findings, these tables are:
- ✅ Empty (0 records)
- ✅ Not used by any backend model
- ✅ Not accessed by any API endpoint
- ✅ Not used by any frontend page

### Tables Identified:
1. `campaign_drivers` - 0 records
2. `campaign_vehicles` - 0 records
3. `campaign_promoters` - 0 records
4. `expense_payments` - 0 records

---

## 🔍 VERIFICATION STEP (MANDATORY)

**Run this BEFORE cleanup to confirm tables are still empty:**

```sql
-- Connect to database
docker compose exec -T mysql mysql -u fleetuser -pfleetpass123 fleet_operations

-- Check counts
SELECT 'campaign_drivers' as table_name, COUNT(*) as count FROM campaign_drivers
UNION ALL
SELECT 'campaign_vehicles', COUNT(*) FROM campaign_vehicles
UNION ALL
SELECT 'campaign_promoters', COUNT(*) FROM campaign_promoters
UNION ALL
SELECT 'expense_payments', COUNT(*) FROM expense_payments;

-- Expected output: All counts should be 0
```

**If ANY table has data → STOP and review with team!**

---

## ⚠️ BACKUP STEP (MANDATORY)

**Create backup before any deletion:**

```bash
# Backup entire database
docker compose exec mysql mysqldump -u fleetuser -pfleetpass123 fleet_operations > backup_before_cleanup_$(date +%Y%m%d).sql

# Or backup just these tables
docker compose exec mysql mysqldump -u fleetuser -pfleetpass123 fleet_operations \
  campaign_drivers campaign_vehicles campaign_promoters expense_payments \
  > backup_junction_tables_$(date +%Y%m%d).sql
```

---

## 🗑️ CLEANUP SQL (Run with Alembic)

### Option 1: Create Alembic Migration (RECOMMENDED)

```bash
# Navigate to backend directory
cd /home/recharge/projects/Ops360/backend

# Create new migration
alembic revision -m "remove_unused_junction_tables"
```

**Edit the generated migration file:**

```python
"""remove_unused_junction_tables

Revision ID: xxxxxxxxxx
Revises: c2a428a1335d
Create Date: 2026-01-12

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxxxxxxxxx'
down_revision = 'c2a428a1335d'
branch_labels = None
depends_on = None

def upgrade():
    # Drop unused junction tables (verified empty)
    op.drop_table('campaign_drivers')
    op.drop_table('campaign_vehicles')
    op.drop_table('campaign_promoters')
    op.drop_table('expense_payments')

def downgrade():
    # Recreate tables if rollback needed
    op.create_table(
        'campaign_drivers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=False),
        sa.Column('assigned_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'campaign_vehicles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('assigned_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'campaign_promoters',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('promoter_id', sa.Integer(), nullable=False),
        sa.Column('assigned_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.ForeignKeyConstraint(['promoter_id'], ['promoters.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'expense_payments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('vendor_id', sa.Integer(), nullable=True),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('payment_type', sa.String(100), nullable=True),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'paid'), nullable=True),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
```

**Apply migration:**

```bash
# Test migration (dry run)
alembic upgrade head --sql > /tmp/migration_preview.sql
cat /tmp/migration_preview.sql  # Review SQL

# Apply migration
docker compose exec backend alembic upgrade head
```

---

### Option 2: Direct SQL (NOT RECOMMENDED - Use Alembic)

**⚠️ Only if you absolutely cannot use Alembic:**

```sql
-- Connect to database
docker compose exec -T mysql mysql -u fleetuser -pfleetpass123 fleet_operations

-- Drop tables
DROP TABLE IF EXISTS campaign_drivers;
DROP TABLE IF EXISTS campaign_vehicles;
DROP TABLE IF EXISTS campaign_promoters;
DROP TABLE IF EXISTS expense_payments;

-- Verify removal
SHOW TABLES LIKE 'campaign_%';
SHOW TABLES LIKE 'expense_payments';
```

**⚠️ Warning**: This bypasses Alembic version control!

---

## ✅ POST-CLEANUP VERIFICATION

**After cleanup, verify system still works:**

```bash
# 1. Check database tables
docker compose exec -T mysql mysql -u fleetuser -pfleetpass123 fleet_operations -e "SHOW TABLES;"

# 2. Check Alembic version
docker compose exec backend alembic current

# 3. Restart backend
docker compose restart backend

# 4. Test frontend
# - Login as admin
# - Create campaign
# - Check all dashboards
# - Verify no errors in console
```

---

## 🔄 ROLLBACK PLAN

**If something breaks after cleanup:**

```bash
# Rollback Alembic migration
docker compose exec backend alembic downgrade -1

# Or restore from backup
docker compose exec -i mysql mysql -u fleetuser -pfleetpass123 fleet_operations < backup_before_cleanup_20260112.sql

# Restart services
docker compose restart backend
```

---

## 📝 DECISION LOG

**Document your decision:**

```
Date: [FILL DATE]
Decision: [KEEP / REMOVE]
Reason: [YOUR REASON]
Approved By: [TEAM MEMBER]
Executed By: [WHO RAN THE SCRIPT]
Result: [SUCCESS / FAILED / ROLLED BACK]
```

---

## 🎯 RECOMMENDATION

**Our Recommendation**: ✅ **SAFE TO REMOVE**

**Reasoning**:
1. ✅ All 4 tables verified empty (0 records)
2. ✅ No backend models using these tables
3. ✅ No API endpoints accessing them
4. ✅ No frontend pages referencing them
5. ✅ Alternative tables exist (driver_assignments, promoter_activities)
6. ✅ Full backup can be taken
7. ✅ Alembic migration allows easy rollback

**However**: 
- ⚠️ Always consult team before removal
- ⚠️ Document decision
- ⚠️ Create backup
- ⚠️ Use Alembic for proper version control

---

## 📞 WHEN TO KEEP TABLES

**Keep if**:
- 📌 Team plans to use them in future
- 📌 They are part of documented architecture
- 📌 External systems might reference them
- 📌 They are part of a planned feature

**In that case**: Just document their purpose and mark as "Future Use"

---

## 🎓 BEST PRACTICES FOLLOWED

✅ **Audit First** - Thoroughly analyzed before suggesting removal  
✅ **Verify Empty** - Confirmed 0 records in all tables  
✅ **Backup Plan** - Full database backup recommended  
✅ **Version Control** - Use Alembic for tracking changes  
✅ **Rollback Ready** - Downgrade migration provided  
✅ **Team Review** - Require approval before execution  
✅ **Document Decision** - Log all cleanup actions  
✅ **Test After** - Verify system still works  

---

**Status**: ⏳ **AWAITING TEAM DECISION**

**Action Required**: 
1. Review this document
2. Discuss with team
3. Make decision (KEEP or REMOVE)
4. If REMOVE: Follow Alembic migration path
5. Document outcome

---

*Prepared by AI Assistant - 12 January 2026*
