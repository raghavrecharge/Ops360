# Password Management Guide - Direct Database Access

## 🎯 Sabse Simple Tarika (2 Steps)

### Step 1: Hash Generate Karo
```bash
docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('YourPassword123'))"
```

**Output Example:**
```
$2b$12$abcdefg1234567890...
```

### Step 2: Database Me Update Karo
```bash
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations
```

**Then run this SQL:**
```sql
UPDATE users 
SET password_hash = '$2b$12$abcdefg1234567890...',  -- Step 1 se copy karo
    password_hint = 'YourPassword123'                -- Plain password (your reference)
WHERE email = 'admin@fleet.com';
```

---

## ⚡ One-Liner (Ek Hi Command Me Sab)

Ye command copy karo aur apna email/password change karke run karo:

```bash
# Template:
NEW_PASS="YourNewPassword"; \
HASH=$(docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$NEW_PASS'))"); \
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "UPDATE users SET password_hash='$HASH', password_hint='$NEW_PASS' WHERE email='admin@fleet.com';"

# Example 1: Admin password change
NEW_PASS="Admin@2026"; \
HASH=$(docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$NEW_PASS'))"); \
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "UPDATE users SET password_hash='$HASH', password_hint='$NEW_PASS' WHERE email='admin@fleet.com';"

# Example 2: Operations user password change  
NEW_PASS="Operations@2026"; \
HASH=$(docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$NEW_PASS'))"); \
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "UPDATE users SET password_hash='$HASH', password_hint='$NEW_PASS' WHERE email='operations@ops360.com';"
```

---

## 📝 Direct MySQL Me (Without Terminal, Pure Database Query)

Agar aap **sirf database me** SQL run karna chahte ho:

### Option 1: Pre-generated Hash Use Karo

```sql
-- Pehle hash generate karo (terminal me)
-- Then ye SQL run karo database me:

UPDATE users 
SET password_hash = '$2b$12$xyz...',  -- Generated hash paste karo
    password_hint = 'MyPassword123'    -- Plain password
WHERE email = 'user@example.com';
```

### Option 2: Helper Script Use Karo

```bash
# Ye script use karo jo SQL generate karega
./get_password_sql.sh admin@fleet.com NewPassword123

# Output SQL copy karke database me paste karo
```

---

## 🔧 Quick Reference Commands

### View Current Password Hints
```sql
SELECT email, password_hint FROM users;
```

### Change Password (Full Command)
```bash
# Change admin password
NEW_PASS="MyNewPass"; HASH=$(docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$NEW_PASS'))"); docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "UPDATE users SET password_hash='$HASH', password_hint='$NEW_PASS' WHERE email='admin@fleet.com'; SELECT email, password_hint FROM users WHERE email='admin@fleet.com';"
```

### Test Login After Change
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"MyNewPass"}'
```

---

## ⚠️ Important Notes

1. **password_hint** me plain password store hoga (visible in database)
2. **password_hash** me encrypted version (bcrypt)
3. Login hamesha **password_hash** se hota hai
4. **password_hint** sirf aapke reference ke liye hai

---

## 🎯 Aapke Liye Sabse Easy Way

### Copy This Complete Template:

```bash
#!/bin/bash
# Just change these two variables:
EMAIL="admin@fleet.com"
NEW_PASSWORD="YourNewPassword123"

# Rest is automatic:
HASH=$(docker exec fleet_backend python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$NEW_PASSWORD'))")
docker exec fleet_mysql mysql -u root -psecretpassword fleet_operations -e "UPDATE users SET password_hash='$HASH', password_hint='$NEW_PASSWORD' WHERE email='$EMAIL'; SELECT CONCAT('✅ Password updated for: ', email, ' | New Password: ', password_hint) as Result FROM users WHERE email='$EMAIL';"
```

**Usage:**
1. Copy above script
2. Change `EMAIL` and `NEW_PASSWORD` 
3. Run it
4. Done! ✅
