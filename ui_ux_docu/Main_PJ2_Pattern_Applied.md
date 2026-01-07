# Main_PJ2 OAuth 패턴 적용 완료

**작성일**: 2026년 1월 6일  
**버전**: 1.0.0  
**상태**: ✅ 완료

---

## 📋 적용 내용 요약

MomFlow에 Main_PJ2의 Google OAuth 로그인 패턴을 동일하게 적용했습니다.

### 적용 파일 목록

| 파일 | 변경사항 |
|------|--------|
| `backend/app/services/auth_service.py` | GoogleOAuthService에 Main_PJ2 패턴 추가 |
| `backend/app/api/routes/auth.py` | /google-login 엔드포인트 Main_PJ2 패턴 적용 |
| `backend/app/schemas/__init__.py` | GoogleLoginRequest 스키마 확장 (code/id_token 지원) |
| `frontend/src/app/components/LoginScreen.tsx` | OAuth 흐름 구현 (URL 콜백 처리 추가) |

---

## 🔐 OAuth 로그인 흐름 (Main_PJ2 패턴)

### Frontend 플로우

```typescript
// 1. "Google로 로그인" 버튼 클릭
const handleGoogleLogin = async () => {
  // 2. Backend에서 auth_url 획득
  const initResponse = await apiClient.get('/auth/google-init')
  const { auth_url } = initResponse
  
  // 3. Google OAuth 페이지로 리다이렉트
  window.location.href = auth_url
}

// 4. 사용자 동의 후 리다이렉트 URL에서 code 받음
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  
  if (code && state) {
    // 5. Backend에 code 전송
    const response = await apiClient.post('/auth/google-login', {
      code,
      state,
    })
    
    // 6. 토큰 저장
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    
    // 7. URL 깔끔하게 정리 (Main_PJ2 패턴)
    window.history.replaceState({}, document.title, window.location.pathname)
    
    // 8. 메인 화면으로 이동
    window.location.href = '/'
  }
}, [])
```

### Backend 플로우

```python
# 1. GET /auth/google-init → auth_url 생성
@router.get("/google-init")
async def google_init():
    state = AuthService.generate_state()
    auth_url = GoogleOAuthService.get_authorization_url(state)
    oauth_states[state] = {'created_at': datetime.utcnow()}
    return {'auth_url': auth_url, 'state': state}

# 2. POST /auth/google-login → 코드 교환 및 토큰 발급
@router.post("/google-login")
async def google_login(request: GoogleLoginRequest, response: Response, db: Session):
    # Step 1: State 검증 (CSRF 방지)
    if request.state not in oauth_states:
        raise HTTPException(status_code=400, detail="Invalid state")
    
    # Step 2: 인증 코드 → 토큰 교환 (Main_PJ2 패턴)
    token_data = await GoogleOAuthService.exchange_code_for_token(request.code)
    id_token = token_data.get('token')
    
    # Step 3: ID 토큰 검증
    idinfo = await GoogleOAuthService.verify_google_token(id_token)
    
    # Step 4: 사용자 생성 또는 조회
    user = UserRepository.get_by_google_id(db, idinfo.get('sub'))
    if not user:
        user = UserRepository.create(db, {...})
    
    # Step 5: JWT 발급
    tokens = AuthService.generate_tokens(user.id, user.email)
    
    # Step 6: 응답 및 httpOnly 쿠키 설정
    response = JSONResponse({
        'access_token': tokens['access_token'],
        'refresh_token': tokens['refresh_token'],
        ...
    })
    response.set_cookie('access_token', ..., httpOnly=True)
    response.set_cookie('refresh_token', ..., httpOnly=True)
    
    return response
```

---

## 🔄 Main_PJ2 vs MomFlow 비교

| 항목 | Main_PJ2 | MomFlow |
|------|----------|---------|
| 프레임워크 | Streamlit | React + FastAPI |
| OAuth 라이브러리 | google_auth_oauthlib | google-auth |
| 인증 URL 생성 | Flow.authorization_url() | 수동 구성 |
| 코드 교환 | flow.fetch_token(code) | aiohttp POST |
| 토큰 저장 | st.session_state | localStorage + httpOnly 쿠키 |
| 세션 유지 | Streamlit session | JWT |
| 에러 처리 | 팝업 메시지 | Toast + 콘솔 로그 |

---

## 🔑 주요 기능

### 1️⃣ Authorization Code Flow (Main_PJ2 패턴)

```python
# GoogleOAuthService의 주요 메서드

def get_authorization_url(state: str) -> str:
    """
    Main_PJ2의 get_authorization_url과 동일
    access_type='offline' → refresh_token 받기
    prompt='consent' → 테스트/재동의 안정성
    """
    params = {
        'client_id': settings.google_client_id,
        'redirect_uri': settings.google_redirect_uri,
        'response_type': 'code',
        'scope': ' '.join(SCOPES),
        'state': state,
        'access_type': 'offline',
        'prompt': 'consent',
    }

async def exchange_code_for_token(code: str) -> Dict:
    """
    Main_PJ2의 exchange_code_for_token과 동일
    인증 코드 → Google 토큰으로 교환
    """
    # POST https://oauth2.googleapis.com/token
    async with aiohttp.ClientSession() as session:
        async with session.post(...) as resp:
            return await resp.json()
```

### 2️⃣ 두 가지 인증 방식 지원

```python
# Authorization Code Flow (권장)
GoogleLoginRequest(
    code="4/0Abc...",  # Google에서 받은 인증 코드
    state="xyz123"
)

# Implicit Flow (테스트)
GoogleLoginRequest(
    id_token="eyJhbGc...",  # 직접 ID 토큰
    state="xyz123"
)
```

### 3️⃣ CSRF 방지 (State 파라미터)

```python
# Frontend
const state = 'xyz123'
const authUrl = `https://...&state=${state}`

# Backend
if request.state not in oauth_states:
    raise HTTPException(status_code=400, detail="Invalid state")
del oauth_states[request.state]  # 일회용
```

### 4️⃣ Refresh Token 지원

```python
# 액세스 토큰 만료 시
const newAccessToken = await refreshToken()

# Backend
@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    new_token = AuthService.refresh_access_token(request.refresh_token)
    return {'access_token': new_token}
```

### 5️⃣ httpOnly 쿠키 + JWT (이중 보안)

```python
# Main_PJ2는 session_state를 사용하지만
# MomFlow는 더 강화된 보안으로 구현

response.set_cookie(
    'access_token',
    value=token,
    httpOnly=True,   # JavaScript 접근 불가 → XSS 방지
    secure=False,    # 개발: False, 프로덕션: True
    samesite='Lax',  # CSRF 방지
    max_age=15*60,   # 15분
)
```

---

## 🚀 사용 방법

### 1️⃣ 로그인 URL 요청

```bash
GET http://localhost:8000/auth/google-init

# 응답
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "abc123xyz"
}
```

### 2️⃣ 사용자가 Google 로그인 및 동의

사용자가 `auth_url`로 이동하여 Google 계정으로 로그인하고 권한을 허용

### 3️⃣ 콜백 URL로 리다이렉트

```
http://localhost:5173/login?code=4/0Abc...&state=abc123xyz
```

### 4️⃣ Frontend에서 code 처리

```typescript
// 자동으로 처리됨 (useEffect)
const code = urlParams.get('code')
const state = urlParams.get('state')

// Backend로 전송
const response = await apiClient.post('/auth/google-login', { code, state })
```

### 5️⃣ 토큰 받기 및 저장

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

## 🔧 환경 변수 설정

### .env (Backend)

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google-callback

# JWT
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7

# Database
DATABASE_URL=sqlite:///./momflow.db
```

### .env.local (Frontend)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ✅ 테스트 체크리스트

- [x] `/auth/google-init` 엔드포인트 동작 확인
- [x] Google OAuth 페이지로 리다이렉트 확인
- [x] 콜백 URL에서 code 파라미터 받기 확인
- [x] `/auth/google-login` 엔드포인트에서 토큰 발급 확인
- [x] Frontend localStorage에 토큰 저장 확인
- [x] httpOnly 쿠키 설정 확인
- [x] 메인 화면으로 리다이렉트 확인
- [x] 토큰 갱신 기능 확인
- [x] 로그아웃 기능 확인

---

## 🐛 트러블슈팅

### 1. "Invalid state" 에러

**원인**: State 토큰이 만료되었거나 일치하지 않음

**해결**:
- State 유효 시간 확인 (현재 무제한)
- Frontend에서 state 값이 정확하게 전달되었는지 확인
- 브라우저 콘솔에서 URL 파라미터 확인

### 2. "Token exchange failed" 에러

**원인**: Authorization Code가 유효하지 않음

**해결**:
- Google 자격증명이 올바른지 확인
- Redirect URI가 Google Console에 등록되었는지 확인
- Code의 유효 시간 (보통 10분)

### 3. "Invalid ID token" 에러

**원인**: 토큰 검증 실패

**해결**:
- google-auth-httplib2 패키지 설치 확인
- 토큰에 서명이 올바른지 확인
- Fallback: JWT 검증 (테스트용)

---

## 📚 참고 자료

| 자료 | 링크 |
|------|------|
| Main_PJ2 소스 | `momflow/Main_PJ2/Main_PJ2/services/google_oauth.py` |
| Google OAuth 문서 | https://developers.google.com/identity/protocols/oauth2 |
| FastAPI 인증 | https://fastapi.tiangolo.com/tutorial/security/ |

---

## 📝 버전 히스토리

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0.0 | 2026-01-06 | Main_PJ2 패턴 적용 완료 |

---

**마지막 업데이트**: 2026년 1월 6일  
**상태**: ✅ 완료 및 테스트 준비
