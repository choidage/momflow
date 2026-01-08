#!/usr/bin/env python3
"""
이메일 업데이트 API 테스트
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_email_update():
    """이메일 업데이트 기능 테스트"""
    
    print("=" * 50)
    print("테스트 1: 테스트 사용자 생성")
    print("=" * 50)
    
    # 테스트 사용자 생성
    try:
        response = requests.post(f"{BASE_URL}/auth/test-google-login")
        response.raise_for_status()
        login_data = response.json()
        
        original_email = login_data['email']
        token = login_data['access_token']
        user_id = login_data['user_id']
        
        print(f"✅ 사용자 생성 성공")
        print(f"   User ID: {user_id}")
        print(f"   Email: {original_email}")
        print(f"   Token: {token[:30]}...")
    except Exception as e:
        print(f"❌ 사용자 생성 실패: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("테스트 2: 이메일 수정")
    print("=" * 50)
    
    # 이메일 수정
    new_email = "updated_email@example.com"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.put(
            f"{BASE_URL}/auth/profile",
            params={"email": new_email},
            headers=headers
        )
        response.raise_for_status()
        update_data = response.json()
        
        print(f"✅ 이메일 수정 성공")
        print(f"   Status: {update_data['status']}")
        print(f"   Message: {update_data['message']}")
        print(f"   New Email: {update_data['email']}")
        
        if update_data['email'] != new_email:
            print(f"❌ 이메일이 올바르게 업데이트되지 않았습니다.")
            return False
            
    except Exception as e:
        print(f"❌ 이메일 수정 실패: {e}")
        if hasattr(e, 'response'):
            print(f"   Response: {e.response.json()}")
        return False
    
    print("\n" + "=" * 50)
    print("테스트 3: 수정된 이메일로 /me 엔드포인트 확인")
    print("=" * 50)
    
    # 수정된 사용자 정보 조회
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        response.raise_for_status()
        user_data = response.json()
        
        print(f"✅ 사용자 정보 조회 성공")
        print(f"   Email: {user_data['email']}")
        print(f"   Name: {user_data['name']}")
        
        if user_data['email'] != new_email:
            print(f"❌ 이메일이 데이터베이스에 저장되지 않았습니다.")
            return False
            
    except Exception as e:
        print(f"❌ 사용자 정보 조회 실패: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("테스트 4: 중복된 이메일 확인")
    print("=" * 50)
    
    # 다시 새로운 사용자 생성하여 중복 테스트
    try:
        response = requests.post(f"{BASE_URL}/auth/test-google-login")
        response.raise_for_status()
        login_data2 = response.json()
        token2 = login_data2['access_token']
        
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # 첫 번째 사용자의 이메일로 업데이트 시도 (중복)
        response = requests.put(
            f"{BASE_URL}/auth/profile",
            params={"email": new_email},
            headers=headers2
        )
        
        if response.status_code == 400:
            error_data = response.json()
            print(f"✅ 중복된 이메일 에러 정상 처리")
            print(f"   Error: {error_data['detail']}")
        else:
            print(f"❌ 중복된 이메일이 허용되었습니다.")
            return False
            
    except Exception as e:
        print(f"❌ 중복 테스트 실패: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ 모든 테스트 통과!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = test_email_update()
    sys.exit(0 if success else 1)
