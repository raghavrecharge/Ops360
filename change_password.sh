#!/bin/bash

# Simple Password Change Script
# Usage: ./change_password.sh <email> <new_password>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <email> <new_password>"
    echo "Example: $0 admin@fleet.com MyNewPass123"
    exit 1
fi

EMAIL="$1"
NEW_PASSWORD="$2"

echo "════════════════════════════════════════════════════════════════"
echo "  Changing Password for: $EMAIL"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Generate bcrypt hash using backend container
echo "Generating bcrypt hash..."
HASH=$(docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$NEW_PASSWORD'))")

if [ -z "$HASH" ]; then
    echo "❌ Error: Could not generate hash"
    exit 1
fi

echo "✅ Hash generated successfully"
echo ""

# Update database
echo "Updating database..."
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "
UPDATE users 
SET password_hash = '$HASH',
    password_hint = '$NEW_PASSWORD'
WHERE email = '$EMAIL';
" 2>/dev/null

# Verify update
UPDATED=$(docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -se "
SELECT COUNT(*) FROM users WHERE email = '$EMAIL';
" 2>/dev/null)

if [ "$UPDATED" = "1" ]; then
    echo "✅ Password updated successfully!"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  New Credentials:"
    echo "════════════════════════════════════════════════════════════════"
    echo "  Email: $EMAIL"
    echo "  Password: $NEW_PASSWORD"
    echo "  Password Hint: $NEW_PASSWORD (same as password)"
    echo ""
    
    # Test login
    echo "Testing login..."
    RESPONSE=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$NEW_PASSWORD\"}")
    
    if echo "$RESPONSE" | grep -q "access_token"; then
        echo "✅ Login test SUCCESSFUL!"
    else
        echo "❌ Login test FAILED"
        echo "Response: $RESPONSE"
    fi
else
    echo "❌ User not found: $EMAIL"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
