# 🔴 403 에러 해결 가이드

## 문제 원인
Google OAuth 리다이렉트 URI 설정이 잘못되어 있었습니다.

### 이전 설정 (❌ 에러 발생)
- **백엔드 config**: `http://localhost:8000/api/auth/google-callback`
- **프론트엔드 실제 처리**: `http://localhost:5173` (LoginScreen의 handleOAuthCallback)
- **결과**: CORS 정책 위반 → 403 Forbidden 에러

### 올바른 흐름

```
1. LoginScreen에서 "Google로 시작하기" 클릭
   ↓
2. apiClient.getGoogleInitUrl() → /auth/google-init 호출
   ↓
3. 받은 auth_url로 리다이렉트 (Google OAuth 페이지)
   ↓
4. 사용자 동의 후 Google이 리다이렉트
   ↓
5. 프론트엔드 http://localhost:5173?code=...&state=...로 돌아옴
   ↓
6. LoginScreen의 handleOAuthCallback에서 code 추출
   ↓
7. apiClient.googleLogin(code, state) → /auth/google-login 호출
   ↓
8. 토큰 받음 → localStorage에 저장
```

## 해결 방법

### ✅ 1단계: 백엔드 설정 변경 (완료)
파일: `backend/app/config.py` 라인 36-40

```python
# 변경 전
google_redirect_uri: str = (
    "https://localhost.momflow.com/auth/google-callback"
    if os.getenv("ENVIRONMENT", "development") == "development"
    else "https://api.momflow.com/auth/google-callback"
)

# 변경 후
google_redirect_uri: str = (
    "http://localhost:5173"
    if os.getenv("ENVIRONMENT", "development") == "development"
    else "https://momflow.com"
)
```

**상태**: ✅ 이미 수정됨

---

### 🔴 2단계: Google Cloud Console 업데이트 필수

#### 현재 설정 확인 방법:
1. [Google Cloud Console](https://console.cloud.google.com) 열기
2. 프로젝트 선택 (MomFlow)
3. 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
4. "MomFlow Client" OAuth 클라이언트 클릭

#### 변경 필요 항목:
**승인된 리다이렉트 URI** 목록에서:

```
❌ 제거 필요:
- http://localhost:8000/api/auth/google-callback
- https://localhost.momflow.com/auth/google-callback

✅ 추가 필요:
- http://localhost:5173                           (개발 환경)
- https://momflow.com                             (프로덕션)
```

**변경 후 꼭 저장(Save) 클릭!**

---

## 변경 후 테스트

### 1. 백엔드 재시작
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. 프론트엔드 새로고침
```
Ctrl+Shift+R (또는 Ctrl+F5)
```

### 3. 테스트
1. http://localhost:5173 접속
2. "Google로 시작하기" 클릭
3. ❌ 403 에러가 나타나지 않아야 함
4. ✅ Google 로그인 페이지로 리다이렉트됨

---

## 체크리스트

- [ ] Google Cloud Console에서 리다이렉트 URI 업데이트
- [ ] 저장(Save) 클릭 확인
- [ ] 백엔드 재시작
- [ ] 프론트엔드 새로고침 (Ctrl+Shift+R)
- [ ] "Google로 시작하기" 클릭
- [ ] Google 로그인 페이지로 이동 확인

---

## 참고

**redirect_uri가 왜 중요한가?**
- OAuth는 보안상 이유로 사전에 등록된 URI로만 리다이렉트 허용
- 리다이렉트 URI가 일치하지 않으면 Google에서 403 Forbidden 반환
- CORS는 프론트엔드에서 백엔드로 가는 요청에 적용
- OAuth 리다이렉트는 전체 페이지 이동이므로 CORS와는 별개

**Main_PJ2 패턴과의 차이점**:
- Main_PJ2는 Streamlit 백엔드에서 토큰 처리
- MomFlow는 React 프론트엔드에서 토큰 처리
- 따라서 리다이렉트 URI가 프론트엔드 URL이어야 함
