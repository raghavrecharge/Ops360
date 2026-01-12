#!/usr/bin/env python3
"""Seed demo data"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime
from app.core.database import SessionLocal
from app.core.auth import get_password_hash
from app.models.user import User, UserRole
from app.models.profile import Profile

def seed_demo_data():
    db = SessionLocal()
    
    try:
        # Create demo user
        demo_user = db.query(User).filter(User.email == "demo@astroos.com").first()
        
        if not demo_user:
            demo_user = User(
                email="demo@astroos.com",
                hashed_password=get_password_hash("demo123"),
                full_name="Demo User",
                role=UserRole.USER,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"✓ Created demo user: {demo_user.email}")
        else:
            print(f"✓ Demo user already exists: {demo_user.email}")
        
        # Create demo profile
        demo_profile = db.query(Profile).filter(Profile.user_id == demo_user.id).first()
        
        if not demo_profile:
            demo_profile = Profile(
                user_id=demo_user.id,
                name="Demo Profile",
                birth_date=datetime(1990, 1, 15, 10, 30),
                birth_time="10:30:00",
                birth_place="New Delhi, India",
                latitude=28.6139,
                longitude=77.2090,
                timezone="Asia/Kolkata",
                ayanamsa="LAHIRI",
                language_preference="en",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(demo_profile)
            db.commit()
            print(f"✓ Created demo profile: {demo_profile.name}")
        else:
            print(f"✓ Demo profile already exists: {demo_profile.name}")
        
        print("\n" + "="*50)
        print("Demo Setup Complete!")
        print("="*50)
        print(f"Email: demo@astroos.com")
        print(f"Password: demo123")
        print("="*50)
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
