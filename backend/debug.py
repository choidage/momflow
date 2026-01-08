#!/usr/bin/env python3
"""
Backend 디버그 스크립트
"""
import sys
import os

# Python 경로 설정
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
os.environ['PYTHONPATH'] = backend_dir

print(f"Backend dir: {backend_dir}")
print(f"Python path: {sys.path[0]}")

try:
    print("\n✅ Step 1: Import FastAPI")
    from fastapi import FastAPI
    print("   Success")
    
    print("\n✅ Step 2: Import app.config")
    from app.config import settings, get_cors_origins
    print("   Success")
    
    print("\n✅ Step 3: Import app.database")
    from app.database import get_db, init_db
    print("   Success")
    
    print("\n✅ Step 4: Import models")
    from app.models.user import User
    from app.models.base import Base
    print("   Success")
    
    print("\n✅ Step 5: Initialize database")
    init_db()
    print("   Success")
    
    print("\n✅ Step 6: Import routes")
    from app.api.routes import auth, todos
    print("   Success")
    
    print("\n✅ Step 7: Create app")
    app = FastAPI(title="Test App")
    print("   Success")
    
    print("\n✅ Step 8: Add CORS middleware")
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("   Success")
    
    print("\n✅ Step 9: Include routers")
    app.include_router(auth.router)
    print("   Success")
    
    print("\n✅ All imports and initialization successful!")
    print("   Ready to start server")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
