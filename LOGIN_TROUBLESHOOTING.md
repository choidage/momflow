# 🔐 MomFlow 로그인 화면 문제 해결 가이드

## 현재 상태 확인

로그인 화면이 보이지 않거나 에러가 나는 경우의 체크리스트:

```
[ ] 1. 백엔드 서버 실행 중 (http://localhost:8000)
[ ] 2. 프론트엔드 서버 실행 중 (http://localhost:5173)
[ ] 3. 환경변수 설정됨 (.env 파일)
[ ] 4. Google OAuth 자격증명 설정됨
[ ] 5. CORS 설정 정상
```

---

## 문제 1: "로그인 초기화 실패" 에러 메시지

### 증상
```
❌ Google로 시작하기 버튼 클릭 시 "로그인 초기화 실패" 에러
```

### 원인
백엔드의 `/auth/google-init` 엔드포인트에서 `auth_url`을 반환하지 못함

### 해결 방법

#### **1단계: 환경변수 확인**

```powershell
# .env 파일이 존재하는지 확인
Test-Path C:\Users\USER\OneDrive\Desktop\ainote\momflow\backend\.env
```

#### **2단계: 실제 Google OAuth 자격증명 설정**

`.env` 파일을 열어서 다음을 수정하세요:

```dotenv
# ❌ 이렇게 되어 있으면 안됨
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# ✅ 실제 값으로 변경 (Google Cloud Console에서 얻기)
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

#### **3단계: Google Cloud Console에서 자격증명 얻기**

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 (없으면)
3. **API 및 서비스** → **사용자 인증 정보**
4. **OAuth 2.0 클라이언트 ID** 만들기
   - 애플리케이션 유형: **웹 애플리케이션**
   - 승인된 리다이렉트 URI: `http://localhost:8000/api/auth/google-callback`
5. `클라이언트 ID`와 `클라이언트 보안 비밀` 복사

#### **4단계: 백엔드 재시작**

```powershell
# 기존 프로세스 종료
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 새로 시작
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow\backend
python run.py
```

---

## 문제 2: API 요청이 실패하는 경우

### 증상
```
❌ Network Error
❌ CORS 오류
❌ 404 Not Found
```

### 원인
- 프론트엔드 환경변수 미설정
- 백엔드 CORS 설정 문제
- 기존 프로세스가 포트 점유

### 해결 방법

#### **1단계: 프론트엔드 환경변수 확인**

`.env` 파일 생성 (있으면 확인):

```
C:\Users\USER\OneDrive\Desktop\ainote\momflow\frontend\.env
```

내용:
```
VITE_API_BASE_URL=http://localhost:8000
```

#### **2단계: 포트 충돌 확인**

```powershell
# 포트 8000 사용 중인 프로세스 찾기
netstat -ano | findstr :8000

# 포트 5173 사용 중인 프로세스 찾기
netstat -ano | findstr :5173

# 모든 프로세스 강제 종료 후 재시작
Get-Process python, node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 자동 스크립트로 재시작
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow
.\start-servers.ps1
```

#### **3단계: 백엔드 CORS 설정 확인**

파일: `C:\Users\USER\OneDrive\Desktop\ainote\momflow\backend\app\config.py`

다음이 포함되어 있는지 확인:

```python
def get_cors_origins():
    """CORS 원본 설정"""
    if settings.environment == "development":
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
        ]
```

---

## 문제 3: 로그인은 되지만 메인 화면이 안 나오는 경우

### 증상
```
✅ Google 로그인 완료
❌ 메인 화면 로드 안됨
```

### 원인
- 토큰이 저장되지 않음
- 프론트엔드 라우팅 오류
- localStorage 권한 문제

### 해결 방법

```powershell
# 1. 브라우저 개발자 도구 열기 (F12)
# 2. Console 탭에서 다음 실행
localStorage.getItem('access_token')  # 토큰이 있으면 OK
localStorage.getItem('refresh_token') # 토큰이 있으면 OK

# 3. Network 탭에서 API 요청 확인
# /auth/google-login 요청의 응답 상태 확인
```

---

## 문제 4: "Google OAuth URL을 받지 못했습니다" 에러

### 원인
백엔드에서 `auth_url` 필드를 반환하지 않음

### 확인 방법

```powershell
# 백엔드 직접 테스트
curl http://localhost:8000/api/auth/google-init

# 응답 예시:
# ✅ {"auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..."}
# ❌ {} 또는 null
```

### 해결 방법

1. `.env` 파일의 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 확인
2. 값이 `YOUR_GOOGLE_CLIENT_ID_HERE` 형태면 실제 값으로 변경
3. 백엔드 재시작

---

## 통합 테스트 (전체 흐름 확인)

```powershell
# 1. 프로세스 정리 및 재시작
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow
.\start-servers.ps1 -Restart

# 2. 브라우저에서 http://localhost:5173 접속
# 3. 로그인 화면 확인
# 4. Google 버튼 클릭
# 5. Google OAuth 페이지로 리다이렉트 되는지 확인

# 6. 백엔드 로그 확인 (터미널에서)
# ✅ "User {email} logged in successfully" 메시지 나타나면 성공
```

---

## 체크리스트: 모든 설정이 됐는지 확인

### 백엔드 (.env 파일)
- [ ] `GOOGLE_CLIENT_ID=` (실제 ID)
- [ ] `GOOGLE_CLIENT_SECRET=` (실제 시크릿)
- [ ] `GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google-callback`
- [ ] `JWT_SECRET=` (32자 이상, 변경됨)
- [ ] `.env` 파일이 backend 폴더에 있음

### 프론트엔드 (.env 파일)
- [ ] `VITE_API_BASE_URL=http://localhost:8000`
- [ ] `.env` 파일이 frontend 폴더에 있음

### 서버 상태
- [ ] `http://localhost:8000/health` → 200 OK
- [ ] `http://localhost:5173` → 페이지 로드됨
- [ ] 터미널에 서버 실행 메시지 있음

### Google Cloud 설정
- [ ] Google Cloud Console 프로젝트 생성
- [ ] OAuth 2.0 클라이언트 ID 생성
- [ ] 리다이렉트 URI: `http://localhost:8000/api/auth/google-callback` 추가
- [ ] 클라이언트 ID, 보안 비밀 복사하여 .env에 입력

---

## 🆘 여전히 안 되면?

### 백엔드 로그 확인
```powershell
# python run.py를 실행한 터미널의 에러 메시지 확인
# "ModuleNotFoundError", "FileNotFoundError" 등이 있으면 보고
```

### 프론트엔드 콘솔 에러 확인
```
브라우저 개발자 도구 (F12) → Console 탭에서 빨간 에러 메시지 확인
```

### API 응답 확인
```powershell
# Google init API 테스트
curl -X GET http://localhost:8000/api/auth/google-init

# 응답이 JSON이 아니면 백엔드 문제
# {"auth_url": "..."} 형태여야 정상
```

---

## 🔗 참고 자료

- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 설정 가이드](../ui_ux_docu/google-issue.md)
- [Main_PJ2 패턴 참고](../ui_ux_docu/Main_PJ2_Pattern_Applied.md)
- [서버 문제 해결](./SERVER_TROUBLESHOOTING.md)

---

**작성일:** 2025-01-06  
**마지막 업데이트:** 2025-01-06
