#!/usr/bin/env python
"""403 에러 진단 스크립트"""
import requests
import json

print("🔍 403 에러 진단")
print()

# 1. google-init 요청 (Preflight)
print("1️⃣ Preflight 요청 (OPTIONS):")
try:
    r = requests.options(
        'http://localhost:8000/auth/google-init',
        headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
        },
        timeout=3
    )
    print(f"   Status: {r.status_code}")
    if r.status_code == 403:
        print(f"   ❌ 403 에러!")
        print(f"   Response: {r.text}")
    else:
        print(f"   ✅ OK")
except Exception as e:
    print(f"   ❌ 에러: {e}")

print()

# 2. google-init 직접 요청
print("2️⃣ GET /auth/google-init:")
try:
    r = requests.get(
        'http://localhost:8000/auth/google-init',
        headers={'Origin': 'http://localhost:5173'},
        timeout=3
    )
    print(f"   Status: {r.status_code}")
    if r.status_code == 403:
        print(f"   ❌ 403 에러!")
        print(f"   Response: {r.text}")
    else:
        print(f"   ✅ OK")
except Exception as e:
    print(f"   ❌ 에러: {e}")

print()

# 3. google-callback 요청
print("3️⃣ GET /auth/google-callback (더미):")
try:
    r = requests.get(
        'http://localhost:8000/auth/google-callback',
        params={'code': 'test_code', 'state': 'test_state'},
        headers={'Origin': 'http://localhost:5173'},
        timeout=3
    )
    print(f"   Status: {r.status_code}")
    if r.status_code == 403:
        print(f"   ❌ 403 에러!")
        print(f"   Response: {r.text[:200]}")
    else:
        print(f"   ✅ Status {r.status_code}")
except Exception as e:
    print(f"   ❌ 에러: {e}")

print()

# 4. CORS 헤더 확인
print("4️⃣ CORS 헤더 확인:")
try:
    r = requests.get(
        'http://localhost:8000/auth/google-init',
        headers={'Origin': 'http://localhost:5173'},
        timeout=3
    )
    print(f"   Status: {r.status_code}")
    cors_headers = {
        'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin', 'NOT SET'),
        'Access-Control-Allow-Methods': r.headers.get('Access-Control-Allow-Methods', 'NOT SET'),
        'Access-Control-Allow-Headers': r.headers.get('Access-Control-Allow-Headers', 'NOT SET'),
    }
    for key, val in cors_headers.items():
        print(f"   {key}: {val}")
except Exception as e:
    print(f"   ❌ 에러: {e}")
