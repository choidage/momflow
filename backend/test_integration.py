#!/usr/bin/env python3
"""
MomFlow API 통합 테스트
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_health_check():
    """헬스 체크 테스트"""
    print("🏥 Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_google_init():
    """Google OAuth 초기화 테스트"""
    print("\n🔐 Testing /auth/google-init endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/auth/google-init")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_database():
    """데이터베이스 초기화 테스트"""
    print("\n📊 Testing Database initialization...")
    try:
        from pathlib import Path
        db_path = Path("momflow.db")
        
        # 데이터베이스 파일 존재 확인
        if db_path.exists():
            print(f"✅ Database file exists: {db_path.absolute()}")
            print(f"   Size: {db_path.stat().st_size} bytes")
            return True
        else:
            print(f"⚠️  Database file not created yet")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_imports():
    """주요 모듈 import 테스트"""
    print("\n📦 Testing module imports...")
    try:
        from app.config import settings
        print("✅ app.config imported")
        
        from app.database import get_db
        print("✅ app.database imported")
        
        from app.services.auth_service import AuthService, GoogleOAuthService
        print("✅ app.services.auth_service imported")
        
        from app.services.ai_service import GeminiSTTService, ClaudeOCRService
        print("✅ app.services.ai_service imported")
        
        from app.repositories.user_repo import UserRepository
        print("✅ app.repositories.user_repo imported")
        
        from app.api.routes import auth
        print("✅ app.api.routes.auth imported")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    """전체 테스트 실행"""
    print("=" * 60)
    print("🚀 MomFlow API Integration Tests")
    print("=" * 60)
    
    results = {
        "Health Check": test_health_check(),
        "Google OAuth Init": test_google_init(),
        "Database Initialization": test_database(),
        "Module Imports": test_imports(),
    }
    
    print("\n" + "=" * 60)
    print("📋 Test Summary")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n총 {passed}/{total} 테스트 통과")
    
    if passed == total:
        print("\n🎉 모든 테스트 통과!")
        return 0
    else:
        print(f"\n⚠️  {total - passed}개 테스트 실패")
        return 1

if __name__ == "__main__":
    exit(main())
