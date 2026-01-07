#!/usr/bin/env python
import requests

print("백엔드 테스트 중...")
try:
    r = requests.get('http://localhost:8000/auth/google-init', timeout=3)
    print(f"상태: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"✅ 성공! Auth URL 생성됨")
        print(f"State: {data.get('state', '')[:30]}...")
    else:
        print(f"❌ 에러: {r.text[:100]}")
except Exception as e:
    print(f"❌ 연결 실패: {e}")
