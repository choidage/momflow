#!/usr/bin/env python
"""
MomFlow API 빠른 테스트 스크립트
"""
import subprocess
import time
import sys
import os

def start_server():
    """백엔드 서버 시작"""
    print("🚀 FastAPI 서버 시작 중...")
    try:
        proc = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd="C:\\Users\\USER\\OneDrive\\Desktop\\ainote\\momflow\\backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(3)
        return proc
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        return None

def test_health():
    """헬스 체크 테스트"""
    print("\n🏥 헬스 체크 테스트...")
    try:
        import requests
        r = requests.get("http://localhost:8000/health", timeout=5)
        if r.status_code == 200:
            print(f"✅ 헬스 체크 성공: {r.json()}")
            return True
        else:
            print(f"❌ 헬스 체크 실패: {r.status_code}")
            return False
    except Exception as e:
        print(f"❌ 요청 실패: {e}")
        return False

def test_oauth():
    """Google OAuth 초기화 테스트"""
    print("\n🔐 Google OAuth 초기화 테스트...")
    try:
        import requests
        r = requests.get("http://localhost:8000/auth/google-init", timeout=5)
        if r.status_code == 200:
            data = r.json()
            print(f"✅ OAuth 초기화 성공")
            print(f"   - Auth URL: {data['auth_url'][:60]}...")
            print(f"   - State: {data['state'][:20]}...")
            return True
        else:
            print(f"❌ OAuth 초기화 실패: {r.status_code}")
            return False
    except Exception as e:
        print(f"❌ 요청 실패: {e}")
        return False

def list_endpoints():
    """API 엔드포인트 나열"""
    print("\n📋 API 엔드포인트 목록")
    endpoints = {
        "Auth (6)": [
            "GET /auth/google-init",
            "POST /auth/google-login",
            "POST /auth/refresh",
            "POST /auth/logout",
            "GET /auth/me",
            "GET /health"
        ],
        "Todos (9)": [
            "GET /todos/",
            "GET /todos/today",
            "GET /todos/stats",
            "GET /todos/{id}",
            "POST /todos/",
            "PUT /todos/{id}",
            "DELETE /todos/{id}",
            "PATCH /todos/{id}/status",
            "POST /todos/{id}/checklist"
        ],
        "Receipts (7)": [
            "GET /receipts/",
            "GET /receipts/stats",
            "GET /receipts/{id}",
            "POST /receipts/ocr",
            "POST /receipts/",
            "PUT /receipts/{id}",
            "DELETE /receipts/{id}"
        ],
        "AI (5)": [
            "POST /ai/stt/transcribe",
            "POST /ai/ocr/extract-text",
            "POST /ai/ocr/extract-receipt",
            "POST /ai/ocr/extract-contact",
            "GET /ai/health"
        ],
        "Family (5)": [
            "GET /family/members",
            "POST /family/members",
            "GET /family/members/{id}",
            "PUT /family/members/{id}",
            "DELETE /family/members/{id}"
        ]
    }
    
    for category, eps in endpoints.items():
        print(f"\n{category}")
        for ep in eps:
            print(f"  {ep}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 MomFlow API 빠른 테스트")
    print("=" * 60)
    
    # 서버 시작
    proc = start_server()
    if not proc:
        sys.exit(1)
    
    try:
        # 테스트 실행
        results = []
        results.append(("헬스 체크", test_health()))
        results.append(("Google OAuth", test_oauth()))
        
        # API 목록 표시
        list_endpoints()
        
        # 결과 요약
        print("\n" + "=" * 60)
        print("📊 테스트 결과")
        print("=" * 60)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")
        
        print(f"\n총 {passed}/{total} 테스트 통과")
        
        if passed == total:
            print("\n✨ 모든 기본 테스트 통과!")
            print("\n다음 단계:")
            print("1. 프론트엔드 시작: npm run dev")
            print("2. 전체 API 테스트 진행")
            print("3. 프로덕션 배포 준비")
        
    finally:
        # 서버 종료
        print("\n🛑 서버 종료 중...")
        proc.terminate()
        proc.wait(timeout=5)
