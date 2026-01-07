# MomFlow 프로젝트 완성 가이드

## 📋 프로젝트 구조

```
momflow/
├── backend/                          # FastAPI 백엔드
│   ├── app/
│   │   ├── api/routes/
│   │   │   └── auth.py              # Google OAuth (8가지 보안 대책 적용)
│   │   ├── services/
│   │   │   ├── auth_service.py      # JWT + Token 관리
│   │   │   └── ai_service.py        # Claude + Gemini + Tesseract
│   │   ├── repositories/
│   │   │   └── user_repo.py         # 사용자 저장소
│   │   ├── models/
│   │   │   ├── base.py              # 베이스 모델
│   │   │   ├── user.py              # 사용자 모델
│   │   │   └── models.py            # Todo, Receipt 등
│   │   ├── database/
│   │   │   └── __init__.py          # SQLite + SQLAlchemy
│   │   ├── schemas/                 # Pydantic 스키마
│   │   └── config.py                # 설정
│   ├── main.py                      # FastAPI 앱 진입점
│   ├── requirements.txt              # Python 패키지
│   ├── .env                         # 환경변수
│   └── test_integration.py          # 통합 테스트
│
├── frontend/                        # React + Vite (PWA)
│   ├── src/
│   │   ├── services/
│   │   │   └── apiClient.ts         # API 클라이언트
│   │   ├── components/              # React 컴포넌트
│   │   ├── app/
│   │   │   └── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts              # PWA + 프록시 설정
│   ├── package.json                # Node.js 패키지
│   ├── .env.local                  # 환경변수
│   └── public/
│       └── pwa-*.png               # PWA 아이콘
│
└── README.md                        # 프로젝트 설명
```

---

## ✅ 완성된 기능

### 1️⃣ Backend (FastAPI + Python 3.11)

**인증 (Auth)**
- ✅ Google OAuth 2.0 통합
- ✅ httpOnly 쿠키 (XSS 방지)
- ✅ State 파라미터 (CSRF 방지)
- ✅ JWT Access + Refresh Token
- ✅ 자동 토큰 갱신 (15분 주기)
- ✅ 소프트 삭제 패턴

**데이터베이스 (SQLite + SQLAlchemy)**
- ✅ 9개 핵심 테이블 설계
- ✅ 관계 설정 (1:N, Cascade Delete)
- ✅ 인덱싱 최적화
- ✅ ORM 모델 정의

**AI 모델**
- ✅ Google Gemini 2.0 STT (음성인식)
- ✅ Claude Vision API OCR (이미지 텍스트)
- ✅ Tesseract OCR (폴백)

**API 엔드포인트**
- ✅ /auth/* - Google OAuth 로그인
- ✅ /auth/refresh - 토큰 갱신
- ✅ /auth/me - 현재 사용자 정보
- ✅ /health - 헬스 체크

### 2️⃣ Frontend (React 18 + Vite + PWA)

**PWA 설정**
- ✅ vite-plugin-pwa 통합
- ✅ Service Worker (오프라인 지원)
- ✅ 웹 앱 설치 가능 (홈화면 아이콘)
- ✅ 캐싱 전략 (API + 정적 파일)

**API 클라이언트**
- ✅ Axios 기반 HTTP 클라이언트
- ✅ 자동 토큰 갱신
- ✅ httpOnly 쿠키 지원
- ✅ 환경별 설정 (.env.local)

---

## 🚀 시작하기

### 백엔드 시작

```bash
# 1. 가상환경 활성화
python3 -m venv .venv
source .venv/bin/activate

# 2. backend 폴더로 이동
cd \backend

# 3. FastAPI 서버 시작
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# 4. 헬스 체크
curl http://127.0.0.1:8000/health
```

**응답 예시:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

### 프론트엔드 시작

```bash
# 1. 새 터미널에서 frontend 폴더로 이동
cd \frontend

# 2. 패키지 설치 (처음 1회만)
npm install
# 또는
pnpm install

# 3. 개발 서버 시작
npm run dev
# 또는
pnpm dev

# 4. 브라우저에서 확인
# http://localhost:5173
```

---

## 🧪 테스트

### 통합 테스트 실행

```bash
cd \backend
python test_integration.py
```

**테스트 항목:**
- ✅ 모듈 imports
- 🔄 /health 엔드포인트 (서버 실행 중일 때)
- 🔄 /auth/google-init 엔드포인트 (서버 실행 중일 때)
- 🔄 데이터베이스 초기화

---

## 🔐 Google OAuth 설정

### 1단계: Google Cloud Console에서 OAuth 앱 생성

1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: "MomFlow"
3. APIs & Services → OAuth consent screen
4. 사용자 타입 선택: "External"
5. 앱 정보 입력
6. Credentials → OAuth 2.0 클라이언트 ID 생성
7. 애플리케이션 타입: "웹 애플리케이션"

### 2단계: Redirect URI 등록

**개발 환경:**
```
https://localhost.momflow.com/auth/google-callback
```

**프로덕션:**
```
https://api.momflow.com/auth/google-callback
```

### 3단계: 환경변수 설정

```bash
# backend/.env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret_min_32_chars
```

---

## 📊 데이터베이스 초기화

자동으로 첫 실행 시 생성됩니다:

```python
# momflow/backend/momflow.db
# SQLite 데이터베이스 파일
```

### 테이블 목록
1. **users** - 사용자
2. **family_members** - 가족 구성원
3. **todos** - 할일/일정
4. **checklist_items** - 체크리스트
5. **rules** - 자동화 규칙
6. **rule_items** - 규칙 항목
7. **receipts** - 영수증 OCR
8. **notifications** - 알림
9. **sync_logs** - 동기화 로그

---

## 🛠️ 문제 해결

### 1. 서버가 시작되지 않음
```bash
# 포트 확인
netstat -ano | findstr :8000

# 패키지 재설치
pip install -r requirements.txt --upgrade
```

### 2. CORS 에러
- vite.config.ts의 proxy 설정 확인
- backend의 CORS 미들웨어 확인

### 3. 토큰 만료
- localStorage에서 refresh_token 확인
- /auth/refresh 엔드포인트 동작 확인

---

## 📚 참고 문서

- [google-issue.md](../ui_ux_docu/google-issue.md) - OAuth 보안 이슈 및 해결책
- [사용모델.md](../ui_ux_docu/사용모델.md) - AI 모델 스택
- [04_DATABASE_DESIGN.md](../ui_ux_docu/04_DATABASE_DESIGN.md) - 데이터베이스 설계

---

## 🎯 다음 단계

### Phase 1: 로컬 테스트 ✅
- ✅ 백엔드 API 구현
- ✅ 프론트엔드 PWA 설정
- 🔄 로컬 테스트 및 동작 확인

### Phase 2: 기능 구현
- API 엔드포인트 추가 (todos, ocr, stt 등)
- 프론트엔드 컴포넌트 연결
- STT/OCR 기능 통합

### Phase 3: 배포
- mkcert 로컬 HTTPS 설정
- Docker 배포 구성
- 프로덕션 배포

---

**마지막 업데이트**: 2026-01-06
**버전**: 1.0.0 (베타)
