#!/usr/bin/env python
import requests

print("✅ Auth URL 확인 중...")
try:
    r = requests.get('http://localhost:8000/auth/google-init', timeout=3)
    if r.status_code == 200:
        data = r.json()
        auth_url = data['auth_url']
        
        # redirect_uri 파라미터 추출
        if 'redirect_uri=' in auth_url:
            redirect_start = auth_url.find('redirect_uri=') + len('redirect_uri=')
            redirect_end = auth_url.find('&', redirect_start)
            if redirect_end == -1:
                redirect_end = len(auth_url)
            redirect_uri = auth_url[redirect_start:redirect_end]
            
            print(f"\n📍 현재 redirect_uri: {redirect_uri}")
            
            if 'localhost:5173' in redirect_uri:
                print("✅ 정상! redirect_uri가 http://localhost:5173로 설정됨")
            else:
                print("❌ 에러! redirect_uri가 여전히 이전 값으로 설정됨")
        else:
            print("❌ Auth URL에 redirect_uri가 없음")
    else:
        print(f"❌ 에러: {r.status_code}")
except Exception as e:
    print(f"❌ 연결 실패: {e}")
