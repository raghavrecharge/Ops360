# AI-Powered Recommendations Setup Guide

## Overview
The ML Insights service now supports **AI-powered recommendations** using OpenAI GPT-3.5-turbo. This provides intelligent, context-aware suggestions instead of simple rule-based logic.

## Current Status
✅ **Implemented** - AI recommendation system is ready
⚠️ **Default Mode** - Currently running in **rule-based mode** (no API key configured)
🎯 **To Enable** - Add OpenAI API key to environment variables

---

## How It Works

### Without API Key (Current - Rule-Based):
```
Campaign Budget >95% → ⚠️ Budget almost exhausted
Performance <60      → 📊 Performance below expectations  
Reliability >90%     → ⭐ Highly reliable vendor
```

### With API Key (AI-Powered):
```
Campaign Data → OpenAI GPT-3.5-turbo → Contextual AI Recommendations

Example AI Output:
"💡 Strong budget discipline at 87% utilization - consider extending campaign timeline"
"🎯 Performance exceeds industry benchmarks - allocate additional resources for scaling"
"⭐ Top-tier vendor reliability (95%) with fast delivery - prioritize for urgent projects"
```

---

## Setup Instructions

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up / Login
3. Create new API key
4. Copy the key (starts with `sk-...`)

### Step 2: Add to Environment
```bash
# Method 1: Add to .env file
echo "OPENAI_API_KEY=sk-your-actual-key-here" >> .env

# Method 2: Export in terminal
export OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Restart Services
```bash
docker compose down
docker compose up -d --build ml-service
```

### Step 4: Verify AI is Enabled
```bash
docker logs fleet_ml_service | grep "AI-powered"
# Should see: ✅ AI-powered recommendations enabled (OpenAI)
```

---

## Testing

### Test Campaign Recommendations:
```bash
# Access ML Insights dashboard
# Navigate to: http://localhost:3000/ml-insights
# Login as admin
# Check "Campaign Performance Insights" → Recommendations column
```

### Test Vendor Recommendations:
```bash
# Scroll to "Vendor Performance Analysis" table
# Check last column "Recommendations"
# AI will provide contextual vendor-specific insights
```

---

## Cost & Usage

### Pricing (OpenAI GPT-3.5-turbo):
- **Input**: $0.50 per 1M tokens (~$0.0005 per request)
- **Output**: $1.50 per 1M tokens (~$0.0015 per request)

### Estimated Monthly Cost:
```
Assumptions:
- 100 campaigns analyzed per day
- 50 vendors analyzed per day
- 2 API calls per insight
- ~300 tokens per request

Daily: 300 requests × $0.002 = $0.60
Monthly: $0.60 × 30 = $18.00

Very affordable for production use! 💰
```

---

## Features

### AI-Powered Recommendations for:
1. ✅ **Campaign Performance** - Budget, ROI, timeline insights
2. ✅ **Vendor Analysis** - Reliability, cost, delivery performance
3. ⏳ **Expense Anomalies** - (Coming soon)
4. ⏳ **Resource Utilization** - (Coming soon)

### Fallback System:
- ✅ **Automatic fallback** to rule-based if AI fails
- ✅ **Graceful degradation** - service never breaks
- ✅ **Error logging** for debugging

---

## Configuration

### Environment Variables:
```bash
# Required for AI
OPENAI_API_KEY=sk-...                    # Your OpenAI API key

# Optional (with defaults)
OPENAI_MODEL=gpt-3.5-turbo              # Model to use
OPENAI_TEMPERATURE=0.7                  # Creativity (0-1)
OPENAI_MAX_TOKENS=300                   # Response length
```

### Model Options:
- `gpt-3.5-turbo` - Fast, cheap, good quality (recommended)
- `gpt-4` - Best quality, slower, 10x more expensive
- `gpt-4-turbo` - Balanced option

---

## Troubleshooting

### Issue: AI recommendations not showing
**Solution:**
```bash
# Check if API key is set
docker exec fleet_ml_service env | grep OPENAI
# Should show: OPENAI_API_KEY=sk-...

# Check logs for errors
docker logs fleet_ml_service | grep -E "AI|OpenAI|error"
```

### Issue: "Rate limit exceeded"
**Solution:**
- Reduce request frequency
- Upgrade OpenAI plan
- Falls back to rule-based automatically

### Issue: "Invalid API key"
**Solution:**
```bash
# Verify key format (should start with sk-)
echo $OPENAI_API_KEY

# Generate new key at platform.openai.com
# Update .env file
# Restart services
```

---

## Code Implementation

### Location:
```
/ml-service/app/analytics/insights_engine.py
```

### Key Methods:
```python
# Campaign recommendations
async def _get_ai_campaign_recommendations(...)
    → Sends campaign data to OpenAI
    → Returns AI-generated insights

# Vendor recommendations  
async def _get_ai_vendor_recommendations(...)
    → Analyzes vendor performance
    → Returns procurement suggestions

# Fallback
def _get_rule_based_vendor_recommendations(...)
    → Simple if/else logic
    → Used when AI unavailable
```

---

## Security

### Best Practices:
- ✅ **Never commit** API keys to git
- ✅ Use `.env` file (ignored by git)
- ✅ Rotate keys regularly
- ✅ Monitor usage on OpenAI dashboard
- ✅ Set spending limits in OpenAI account

### API Key Storage:
```bash
# .env file (NOT committed to git)
OPENAI_API_KEY=sk-...

# docker-compose.yml reads from .env
environment:
  OPENAI_API_KEY: ${OPENAI_API_KEY:-}
```

---

## Next Steps

### To Enable AI Recommendations:
1. Get OpenAI API key (5 minutes)
2. Add to `.env` file (1 line)
3. Restart ML service (1 command)
4. Test in dashboard (instant results)

### Total Time: ~10 minutes

### Questions?
- OpenAI API Docs: https://platform.openai.com/docs
- Support: Contact dev team
- Costs: Check OpenAI usage dashboard

---

## Summary

| Feature | Rule-Based (Current) | AI-Powered (With Key) |
|---------|---------------------|----------------------|
| Setup | ✅ No setup needed | 🔑 API key required |
| Cost | 💰 Free | 💰 ~$18/month |
| Quality | 📊 Basic patterns | 🤖 Contextual insights |
| Fallback | N/A | ✅ Auto falls back |
| Speed | ⚡ Instant | ⚡ 1-2 seconds |

**Recommendation**: Start with rule-based, enable AI when ready for production! 🚀
