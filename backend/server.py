# Backend Server Entry Point
# This file imports the FastAPI app from the Astrolok application

import sys
import os
from pathlib import Path

# Add the backend directory to path for imports
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

# Import the FastAPI app from Astrolok
from app.main import app

# The app is already configured with all routes and middleware in app.main

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
