#!/usr/bin/env python
"""에러 진단 스크립트"""
import sys
import os

# 경로 설정
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 50)
print("🔍 에러 진단 시작")
print("=" * 50)
print()

# 1. 환경 변수 확인
print("1️⃣ 환경 변수 확인:")
try:
    from dotenv import load_dotenv
    load_dotenv()
    
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    jwt_secret = os.getenv("JWT_SECRET")
    
    print(f"  GOOGLE_CLIENT_ID: {'✅ SET' if client_id else '❌ NOT SET'}")
    print(f"  GOOGLE_CLIENT_SECRET: {'✅ SET' if client_secret else '❌ NOT SET'}")
    print(f"  JWT_SECRET: {'✅ SET' if jwt_secret else '❌ NOT SET'}")
except Exception as e:
    print(f"  ❌ 에러: {e}")

print()

# 2. 설정 임포트
print("2️⃣ 설정 임포트:")
try:
    from app.config import settings
    print(f"  ✅ settings 임포트 성공")
    print(f"  Database: {settings.database_url}")
    print(f"  Environment: {settings.environment}")
except Exception as e:
    print(f"  ❌ 에러: {e}")
    import traceback
    traceback.print_exc()

print()

# 3. GoogleOAuthService 확인
print("3️⃣ GoogleOAuthService 확인:")
try:
    from app.services.auth_service import GoogleOAuthService
    print(f"  ✅ GoogleOAuthService 임포트 성공")
    
    # google_auth_url 생성 시도
    state = "test_state_123"
    auth_url = GoogleOAuthService.get_authorization_url(state)
    print(f"  ✅ Auth URL 생성 성공")
    print(f"  URL 첫 100자: {auth_url[:100]}...")
    
except Exception as e:
    print(f"  ❌ 에러: {e}")
    import traceback
    traceback.print_exc()

print()

# 4. 앱 로드
print("4️⃣ FastAPI 앱 로드:")
try:
    from main import app
    print(f"  ✅ FastAPI 앱 로드 성공")
    
    # 라우트 확인
    routes = [r.path for r in app.routes if hasattr(r, 'path')]
    google_routes = [r for r in routes if 'google' in r or 'auth' in r]
    print(f"  등록된 인증 라우트:")
    for route in google_routes:
        print(f"    - {route}")
        
except Exception as e:
    print(f"  ❌ 에러: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 50)
print("🔍 진단 완료")
print("=" * 50)
