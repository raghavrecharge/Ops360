# ML Service Quick Start Guide

## 🚀 Starting the ML Service

### 1. Start All Services
```bash
cd /home/recharge/projects/Ops360
docker-compose up -d
```

### 2. Verify Services Running
```bash
docker ps

# You should see:
# - fleet_mysql
# - fleet_backend
# - fleet_ml_service  ← NEW!
# - fleet_phpmyadmin
```

### 3. Check ML Service Health
```bash
curl http://localhost:8002/health

# Expected response:
# {"status": "healthy", "service": "ml-rag-service"}
```

## 🔑 Admin Access

### Login as Admin
1. Open browser: `http://localhost:3000`
2. Login with admin credentials
3. Look for **ML Insights** in sidebar (🧠 Brain icon)
4. Click to access dashboard

### What You'll See
- **Summary Cards**: Campaigns, performance, alerts
- **Campaign Insights**: Performance scores and recommendations
- **Expense Anomalies**: Unusual expenses detected
- **Utilization Metrics**: Vehicle and driver usage
- **Vendor Performance**: Reliability and cost efficiency

## 🧪 Quick Test

### Test 1: ML Service Direct Access
```bash
# Test ML service analytics endpoint
curl -X POST http://localhost:8002/analytics/dashboard \
  -H "Content-Type: application/json" \
  -d '{
    "campaigns": [
      {
        "id": 1,
        "name": "Test Campaign",
        "budget": 100000,
        "total_expenses": 85000,
        "status": "active"
      }
    ],
    "expenses": [],
    "vehicles": [],
    "drivers": [],
    "vendors": []
  }'
```

### Test 2: Admin API Access
```bash
# 1. Login as admin
TOKEN=$(curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-admin-password"}' \
  | jq -r '.access_token')

# 2. Get ML dashboard
curl http://localhost:8001/api/v1/ml-insights/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Non-Admin Block
```bash
# Login as non-admin user
TOKEN=$(curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "client_user", "password": "password"}' \
  | jq -r '.access_token')

# Try to access ML insights (should fail with 403)
curl http://localhost:8001/api/v1/ml-insights/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"detail": "Not enough permissions"}
```

## 🔍 Troubleshooting

### ML Service Not Starting
```bash
# Check logs
docker logs fleet_ml_service

# Rebuild if needed
docker-compose build ml-service
docker-compose up -d ml-service
```

### "ML service temporarily unavailable" in UI
```bash
# 1. Check if ML service is running
docker ps | grep ml_service

# 2. Check ML service health
curl http://localhost:8002/health

# 3. Check backend can reach ML service
docker exec fleet_backend curl http://ml-service:8002/health

# 4. Restart ML service
docker-compose restart ml-service
```

### No Insights Showing
- Ensure you have campaigns, expenses, vehicles, drivers in database
- ML algorithms need minimum data (3+ records per category)
- Check browser console for errors
- Verify API response in Network tab

## 📊 Sample Data for Testing

```sql
-- Add test campaigns
INSERT INTO campaigns (name, budget, status, project_id, is_active) 
VALUES 
  ('Campaign A', 100000, 'active', 1, true),
  ('Campaign B', 150000, 'active', 1, true),
  ('Campaign C', 80000, 'completed', 2, true);

-- Add test expenses
INSERT INTO expenses (amount, expense_type, campaign_id, expense_date, is_active)
VALUES
  (5000, 'fuel', 1, CURDATE(), true),
  (3000, 'maintenance', 1, CURDATE(), true),
  (15000, 'fuel', 1, CURDATE(), true),  -- Anomaly!
  (4500, 'fuel', 2, CURDATE(), true);
```

## 🎯 Key Features to Test

### 1. Campaign Performance
- Create campaigns with varying budget utilization
- Check performance scores (0-100)
- Verify recommendations match budget usage

### 2. Expense Anomalies
- Add normal expenses (e.g., ₹5,000 fuel)
- Add unusual expense (e.g., ₹15,000 fuel)
- Verify anomaly detection flags unusual expense

### 3. Utilization Insights
- Assign vehicles to campaigns
- Check utilization percentage
- Verify idle time calculations

### 4. Vendor Performance
- Add vendor bookings
- Mark some as completed
- Check reliability score calculation

## 🔐 Security Check

✅ **ML Insights menu visible?**
- Admin: YES ✓
- Other roles: NO ✗

✅ **Can access /ml-insights page?**
- Admin: YES ✓
- Other roles: Redirected to 403 ✗

✅ **API returns data?**
- Admin with token: YES ✓
- Non-admin with token: 403 Forbidden ✗
- No token: 401 Unauthorized ✗

## 📈 Performance Expectations

- Dashboard load time: 2-5 seconds (first load)
- Cached load time: <1 second
- ML processing: 500ms - 2s
- Auto-refresh: Every 5 minutes

## ✅ Success Indicators

1. ✅ ML service container running
2. ✅ Health check returns "healthy"
3. ✅ Admin sees "ML Insights" in navigation
4. ✅ Dashboard displays summary cards
5. ✅ Insights tables populate with data
6. ✅ Recommendations generate correctly
7. ✅ Non-admin users blocked from access

## 🎓 Next Steps

1. **Add Real Data**: Import actual campaigns, expenses, vehicles
2. **Review Insights**: Check recommendations and act on alerts
3. **Monitor Performance**: Track utilization metrics
4. **Optimize Operations**: Follow ML recommendations
5. **Scale Up**: Add more data for better insights

## 📞 Support Commands

```bash
# View ML service logs
docker logs fleet_ml_service -f

# Restart ML service
docker-compose restart ml-service

# Rebuild ML service
docker-compose build ml-service && docker-compose up -d ml-service

# Check all services status
docker-compose ps

# Stop all services
docker-compose down

# Start fresh (warning: deletes data)
docker-compose down -v
docker-compose up -d
```

## 📚 Full Documentation

For complete details, see: `ML_SERVICE_INTEGRATION.md`

---

**Status:** Ready for Testing ✅
**Access Level:** Admin Only 🔒
**Service Port:** 8002 🚀
