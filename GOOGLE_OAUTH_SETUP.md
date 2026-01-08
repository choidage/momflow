# 🔐 Google OAuth 설정 가이드

## ❌ 현재 오류: "액세스 차단됨"

```
403 오류: access_denied
Always Plan은(는) Google 인증 절차를 완료하지 않았습니다.
```

## ✅ 해결 방법

### 1단계: Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 (Always Plan 또는 해당 프로젝트)

### 2단계: OAuth 동의 화면 설정

1. 좌측 메뉴에서 **"API 및 서비스"** → **"OAuth 동의 화면"** 클릭
2. 다음 설정 확인:

#### 필수 항목:

**사용자 유형:**
- ✅ **"외부"** 선택 (일반 사용자)
- 또는 **"내부"** 선택 (G Suite/Google Workspace 조직 계정만 가능)

**앱 정보:**
- 앱 이름: `Always Plan`
- 사용자 지원 이메일: 본인 이메일 (예: `yanggangyiplus@gmail.com`)
- 앱 로고: (선택사항)

**앱 도메인:**
- 개발자 연락처 정보: 본인 이메일 (예: `yanggangyiplus@gmail.com`)

**범위 (Scopes):**
다음 범위가 추가되어 있어야 합니다:
- ✅ `https://www.googleapis.com/auth/userinfo.email`
- ✅ `https://www.googleapis.com/auth/userinfo.profile`
- ✅ `openid`
- ✅ `https://www.googleapis.com/auth/calendar` (Google Calendar 연동용)

**테스트 사용자 (중요!):**
- "테스트 사용자 추가" 클릭
- 본인 이메일 추가: `yanggangyiplus@gmail.com`
- **저장** 클릭

### 3단계: 사용자 인증 정보 확인

1. **"API 및 서비스"** → **"사용자 인증 정보"** 클릭
2. OAuth 2.0 클라이언트 ID 클릭
3. **"승인된 리다이렉트 URI"** 확인:

다음 URI가 포함되어 있어야 합니다:
```
http://localhost:5173
```

### 4단계: 앱 게시 (선택사항)

**참고:** 테스트 모드에서는 최대 100명의 테스트 사용자만 사용 가능합니다.

더 많은 사용자를 위해 앱을 게시하려면:
1. OAuth 동의 화면에서 **"게시"** 클릭
2. Google 검토 프로세스 진행 (보통 1-2주 소요)

**개발 중에는 테스트 사용자 추가로 충분합니다.**

### 5단계: 재시도

1. 브라우저 캐시 및 쿠키 삭제
2. 다시 로그인 시도

---

## 🔍 추가 확인 사항

### 환경변수 확인

`.env` 파일에 다음이 올바르게 설정되어 있는지 확인:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173
```

### 백엔드 서버 재시작

환경변수를 변경했다면 백엔드 서버를 재시작하세요:

```bash
cd backend
python main.py
```

---

## 📝 요약

**가장 중요한 단계:**
1. ✅ Google Cloud Console → OAuth 동의 화면
2. ✅ "테스트 사용자" 섹션에서 본인 이메일 추가
3. ✅ 저장 후 재시도

테스트 사용자로 본인 이메일을 추가하면 즉시 사용 가능합니다!

