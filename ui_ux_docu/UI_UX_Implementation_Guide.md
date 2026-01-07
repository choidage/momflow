# UI/UX 구현 상세 가이드

**작성일**: 2026년 1월 6일  
**프로젝트**: MomFlow - 가족 일정 및 가계부 관리 앱  
**출처**: Figma 디자인 - UI/UX Design Needed (복사)

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [SST(음성 인식) 구현](#sst음성-인식-구현)
3. [카메라 촬영 및 텍스트 추출](#카메라-촬영-및-텍스트-추출)
4. [SQLite Database 구축](#sqlite-database-구축)
5. [API 통합 및 연결](#api-통합-및-연결)
6. [UI/UX 동작 매뉴얼](#uiux-동작-매뉴얼)
7. [주요 고려사항](#주요-고려사항)

---

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: MomFlow
- **설명**: 가족 일정 관리 및 가계부 통합 앱
- **플랫폼**: Web + Mobile (PWA)
- **기술 스택**: React 18.3.1, Vite 6.3.5, TypeScript, Tailwind CSS

### 주요 기능
1. 📅 월간 캘린더 - 가족 일정 관리
2. 👨‍👩‍👧‍👦 가족 구성원 - 멤버 관리 및 역할 설정
3. ✅ 투두 - 할일 목록 및 체크리스트
4. 🧾 영수증 - 가계부 및 OCR 처리
5. 🎤 음성 입력 - STT 기반 메모
6. 📊 통계 - 소비 분석 및 리포트

---

## SST(음성 인식) 구현

### 1️⃣ SST 기술 선택

**선택 기술**: Google Gemini 2.0 STT  
**대체 옵션**: Web Speech API (브라우저 기본)

### 2️⃣ SST 구현 요소

#### Frontend (React)
```typescript
// src/components/VoiceRecording.tsx

interface VoiceRecordingProps {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
}

components:
- RecordButton - 녹음 시작/중지
- WaveformVisualizer - 음파 시각화
- TranscriptionDisplay - 변환 텍스트 표시
```

#### 녹음 프로세스

```
1. 사용자가 "음성 입력" 버튼 클릭
   ↓
2. 마이크 권한 요청 (getUserMedia API)
   ↓
3. 오디오 스트림 캡처 (MediaRecorder)
   ↓
4. WAV/MP3 포맷으로 변환
   ↓
5. 서버로 업로드 (multipart/form-data)
   ↓
6. Gemini API 처리
   ↓
7. 결과 표시 및 저장
```

#### 필요한 라이브러리
- `react-mic` - 음성 녹음
- `wavesurfer.js` - 음파 시각화
- `axios` - API 통신

### 3️⃣ Backend SST 엔드포인트

**엔드포인트**: `POST /ai/stt/transcribe`

```python
# app/api/routes/ai.py

@router.post("/stt/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "ko-KR"
) -> dict:
    """
    음성 파일을 텍스트로 변환
    
    Parameters:
    - file: 음성 파일 (MP3, WAV, OGG, FLAC)
    - language: 언어 코드 (기본값: 한국어)
    
    Returns:
    - transcription: 변환된 텍스트
    - confidence: 신뢰도 (0-1)
    - language_detected: 감지된 언어
    """
```

### 4️⃣ SST 저장 프로세스

```
음성 입력
   ↓
Gemini STT API
   ↓
변환된 텍스트
   ↓
SQLite DB에 저장
   ↓
투두/메모/영수증으로 분류
   ↓
자동 태그 생성
```

### 5️⃣ 에러 처리

| 에러 | 원인 | 해결방안 |
|------|------|--------|
| Microphone 권한 거부 | 사용자가 거부 | 설정 다시 요청 |
| 네트워크 오류 | API 연결 불가 | 로컬 저장 후 재시도 |
| 언어 미지원 | 지원하지 않는 언어 | 기본값(한국어)으로 설정 |
| 파일 크기 초과 | 30MB 이상 | 파일 크기 제한 알림 |

---

## 카메라 촬영 및 텍스트 추출

### 1️⃣ 카메라 촬영

#### Frontend
```typescript
// src/components/CameraCapture.tsx

구성요소:
1. CameraPreview - 카메라 프리뷰
2. CaptureButton - 촬영 버튼
3. FlashToggle - 플래시 토글
4. GalleryAccess - 갤러리 접근
```

#### 촬영 프로세스
```
사용자가 카메라 앱 열기
   ↓
카메라 접근 권한 확인 (getUserMedia API)
   ↓
카메라 프리뷰 표시
   ↓
사용자가 촬영 클릭
   ↓
이미지 캡처 (canvas)
   ↓
미리보기 표시
   ↓
확인/재촬영 선택
```

### 2️⃣ OCR(텍스트 추출)

#### 기술 선택
**우선순위**:
1. Claude Vision API (정확도: 95%)
2. Google Gemini Vision (정확도: 90%)
3. Tesseract (로컬, 정확도: 60-70%)

#### OCR 종류별 처리

**영수증 OCR**
```
사진 업로드
   ↓
Claude Vision API
   ↓
추출 정보:
- 매장명
- 금액
- 날짜
- 아이템
- 결제 수단

DB 저장
```

**텍스트 추출**
```
사진 업로드
   ↓
Gemini Vision API
   ↓
추출 정보:
- 전체 텍스트
- 언어 감지
- 신뢰도

메모/투두로 변환
```

**명함 추출**
```
명함 사진 업로드
   ↓
Claude Vision API
   ↓
추출 정보:
- 이름
- 직급
- 회사명
- 연락처
- 이메일

연락처 DB 저장
```

### 3️⃣ OCR Backend 엔드포인트

**엔드포인트 1**: `POST /ai/ocr/extract-receipt`
```python
# 영수증 OCR 처리

@router.post("/ocr/extract-receipt")
async def extract_receipt(
    file: UploadFile = File(...),
    user_id: str = Header(...)
) -> dict:
    """
    영수증 이미지에서 정보 추출
    
    Returns:
    {
        "vendor": "CU 편의점",
        "amount": 12500,
        "payment_type": "card",
        "date": "2026-01-06",
        "items": ["핫초콜릿", "삼각김밥"],
        "confidence": 0.95,
        "receipt_id": "UUID"
    }
    """
```

**엔드포인트 2**: `POST /ai/ocr/extract-text`
```python
# 일반 텍스트 추출

@router.post("/ocr/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    use_tesseract: bool = False
) -> dict:
    """
    이미지에서 텍스트 추출
    
    Returns:
    {
        "text": "추출된 모든 텍스트...",
        "language": "ko",
        "confidence": 0.92,
        "blocks": [...]  # 텍스트 블록별 좌표
    }
    """
```

**엔드포인트 3**: `POST /ai/ocr/extract-contact`
```python
# 연락처 정보 추출

@router.post("/ocr/extract-contact")
async def extract_contact(
    file: UploadFile = File(...)
) -> dict:
    """
    명함/연락처에서 정보 추출
    
    Returns:
    {
        "name": "홍길동",
        "title": "대리",
        "company": "ABC 회사",
        "phone": "010-1234-5678",
        "email": "hong@abc.com",
        "address": "서울시 강남구..."
    }
    """
```

### 4️⃣ 이미지 처리 파이프라인

```
이미지 업로드
   ↓
유효성 검사
- 파일 크기 (max: 10MB)
- 형식 (JPG, PNG, WEBP)
- 해상도 (최소: 800x600)
   ↓
전처리
- 회전 보정
- 해상도 최적화
- 노이즈 제거
   ↓
OCR 처리
- Claude/Gemini API
- Tesseract (대체)
   ↓
결과 검증
- 신뢰도 확인
- 누락 데이터 확인
   ↓
DB 저장
- 메타데이터 저장
- 원본 이미지 저장
```

---

## SQLite Database 구축

### 1️⃣ 데이터베이스 구조

#### 테이블 1: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    google_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    picture_url VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

#### 테이블 2: todos
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status ENUM('pending', 'completed', 'overdue'),
    priority ENUM('low', 'medium', 'high'),
    tags JSON,  -- ["태그1", "태그2"]
    repeat VARCHAR,  -- "daily", "weekly", "monthly"
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 테이블 3: receipts
```sql
CREATE TABLE receipts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    vendor VARCHAR NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type ENUM('cash', 'card', 'digital'),
    category VARCHAR,  -- "식비", "교통비", "쇼핑"
    date DATE NOT NULL,
    image_url VARCHAR,
    extracted_text TEXT,  -- OCR 결과
    confidence FLOAT,  -- 신뢰도
    items JSON,  -- 영수증 항목
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 테이블 4: family_members
```sql
CREATE TABLE family_members (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    emoji VARCHAR,  -- "👨", "👩", "👧"
    color VARCHAR,  -- "#FF5733"
    relation ENUM('self', 'spouse', 'child', 'parent', 'other'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 테이블 5: rules
```sql
CREATE TABLE rules (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    trigger VARCHAR,  -- "매일 10시", "영수증 등록"
    action TEXT,  -- 자동화 작업
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 테이블 6: notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR,  -- "reminder", "alert", "info"
    title VARCHAR NOT NULL,
    message TEXT,
    scheduled_time TIMESTAMP,
    sent_time TIMESTAMP NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 테이블 7: checklist_items
```sql
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY,
    todo_id UUID NOT NULL,
    title VARCHAR NOT NULL,
    completed BOOLEAN DEFAULT false,
    order_index INT,
    created_at TIMESTAMP,
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);
```

#### 테이블 8: sync_logs
```sql
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id VARCHAR,
    synced_at TIMESTAMP,
    changes_count INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2️⃣ SQLAlchemy ORM 모델

```python
# app/models/models.py

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    google_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    picture_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    todos = relationship("Todo", back_populates="user")
    receipts = relationship("Receipt", back_populates="user")
    family_members = relationship("FamilyMember", back_populates="user")

class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    start_time = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, overdue
    priority = Column(String, default="medium")  # low, medium, high
    tags = Column(JSON, nullable=True)
    repeat = Column(String, nullable=True)  # daily, weekly, monthly
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="todos")
    checklist_items = relationship("ChecklistItem", back_populates="todo", cascade="all, delete-orphan")

class Receipt(Base):
    __tablename__ = "receipts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    vendor = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    payment_type = Column(String, default="card")  # cash, card, digital
    category = Column(String, nullable=True)
    date = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    extracted_text = Column(String, nullable=True)
    confidence = Column(Integer, nullable=True)  # 0-100
    items = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="receipts")
```

### 3️⃣ 데이터베이스 초기화

```python
# app/database/__init__.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import DATABASE_URL
from app.models.base import Base

# SQLite 데이터베이스 연결
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# 테이블 생성
def init_db():
    Base.metadata.create_all(bind=engine)

# Session 팩토리
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 의존성 주입
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 4️⃣ 마이그레이션 전략

```
초기 생성
   ↓
Alembic 마이그레이션 (미래)
   ↓
백업 자동 생성
   ↓
버전 관리
```

---

## API 통합 및 연결

### 1️⃣ API 종류 및 위치

#### 외부 API

| API | 목적 | 엔드포인트 |
|-----|------|----------|
| Google OAuth 2.0 | 인증 | `/auth/google-login` |
| Google Gemini 2.0 | STT, 텍스트 추출 | `/ai/stt/transcribe`, `/ai/ocr/extract-text` |
| Claude Vision | OCR 처리 | `/ai/ocr/extract-receipt`, `/ai/ocr/extract-contact` |
| Tesseract | 로컬 OCR | `/ai/ocr/extract-text` (대체) |

#### 내부 API

| 엔드포인트 | 메소드 | 목적 |
|-----------|--------|------|
| `/todos/` | GET, POST | 투두 조회/생성 |
| `/todos/{id}` | GET, PUT, DELETE | 투두 수정/삭제 |
| `/todos/today` | GET | 오늘 일정 |
| `/receipts/` | GET, POST | 영수증 조회/생성 |
| `/receipts/{id}` | GET, PUT, DELETE | 영수증 수정/삭제 |
| `/family/members` | GET, POST | 가족 멤버 관리 |
| `/ai/health` | GET | AI 서비스 상태 |

### 2️⃣ API 연결 흐름

```
Frontend
   ↓
Axios (API Client)
   ↓
Request 인터셉터
- 토큰 추가
- 헤더 설정
   ↓
Backend (FastAPI)
   ↓
Middleware
- CORS 처리
- 인증 검증
   ↓
Route Handler
- 비즈니스 로직
   ↓
외부 API 호출
- Gemini API
- Claude API
   ↓
Database 저장
   ↓
Response 반환
   ↓
Frontend
- 에러 처리
- 데이터 표시
```

### 3️⃣ 토큰 관리

```python
# Frontend: src/services/apiClient.ts

// Request 인터셉터
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response 인터셉터
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // 토큰 갱신
            const newToken = await refreshToken()
            // 원래 요청 재시도
            return api.request(error.config)
        }
        return Promise.reject(error)
    }
)
```

### 4️⃣ 에러 처리

```
API 호출
   ↓
성공 (200)
   ├── 데이터 저장
   └── UI 업데이트
   
↓

실패
   ├── 401 (Unauthorized)
   │   └── 토큰 갱신
   ├── 403 (Forbidden)
   │   └── 권한 없음 알림
   ├── 404 (Not Found)
   │   └── 자원 없음 알림
   ├── 500 (Server Error)
   │   └── 재시도 또는 로컬 저장
   └── Network Error
       └── 오프라인 모드 진입
```

---

## UI/UX 동작 매뉴얼

### 1️⃣ 로그인 흐름

```
앱 실행
   ↓
LoginScreen 표시
   ↓
"Google로 로그인" 클릭
   ↓
Google OAuth 팝업
   ↓
사용자 동의
   ↓
토큰 받기
   ↓
httpOnly 쿠키 저장
   ↓
메인 화면 이동
```

### 2️⃣ 투두 추가 흐름

```
TodayScreen 열기
   ↓
"+ 추가" 버튼 클릭
   ↓
AddTodoModal 표시
   ↓
1. 제목 입력
2. 날짜 선택
3. 시간 선택 (선택)
4. 우선순위 선택
5. 태그 추가 (선택)
   ↓
"저장" 클릭
   ↓
POST /todos/
   ↓
DB 저장
   ↓
UI 업데이트
   ↓
확인 메시지 표시
```

### 3️⃣ 영수증 추가 흐름

```
ReceiptScreen 열기
   ↓
두 가지 옵션:

옵션 A: 카메라 촬영
   ├── "카메라" 버튼
   ├── 카메라 프리뷰
   ├── 사진 촬영
   └── 이미지 전송

옵션 B: 갤러리 선택
   ├── "갤러리" 버튼
   ├── 이미지 선택
   └── 이미지 전송
   
   ↓ (공통)
   
POST /receipts/ocr
   ↓
Claude Vision 처리
   ↓
정보 추출
- 매장명
- 금액
- 날짜
- 항목
   ↓
ReceiptEditModal 표시
   ↓
정보 수정 (선택)
   ↓
"저장" 클릭
   ↓
DB 저장
   ↓
영수증 목록 업데이트
```

### 4️⃣ 음성 입력 흐름

```
메모 입력 화면
   ↓
마이크 아이콘 클릭
   ↓
마이크 권한 확인
   ↓
"녹음 중..." 상태 표시
   ↓
사용자가 말함
   ↓
"완료" 클릭
   ↓
POST /ai/stt/transcribe
   ↓
Gemini STT 처리
   ↓
텍스트 받기
   ↓
입력 필드에 표시
   ↓
사용자 수정 가능
   ↓
"저장" 클릭
```

### 5️⃣ 캘린더 보기 흐름

```
CalendarHomeScreen 열기
   ↓
현재 월 표시
   ↓
각 날짜에 이벤트 표시
- 투두
- 기념일
- 가족 일정
   ↓
날짜 클릭
   ↓
CalendarDetailScreen 표시
- 해당 날의 모든 일정
- 영수증
- 메모
   ↓
일정 클릭
   ↓
상세 보기 또는 수정
```

---

## 주요 고려사항

### 1️⃣ 성능 최적화

| 항목 | 고려사항 |
|------|--------|
| 이미지 처리 | 대용량 이미지는 압축 후 업로드 |
| OCR 처리 | 비동기 처리 + 로딩 표시 |
| 캘린더 렌더링 | 가상 스크롤링 사용 |
| API 호출 | 요청 캐싱 및 디바운싱 |

### 2️⃣ 보안

| 항목 | 조치 |
|------|------|
| 토큰 | httpOnly 쿠키 저장 |
| 통신 | HTTPS 필수 |
| 입력 | XSS 방지 (입력 검증) |
| CSRF | State 파라미터 사용 |

### 3️⃣ 오프라인 지원

```
PWA 기본 기능:
- Service Worker
- 로컬 캐싱
- IndexedDB
- 동기화 큐

오프라인 모드:
- 로컬 데이터 표시
- 수정사항 큐에 저장
- 온라인 복구 시 동기화
```

### 4️⃣ 국제화 (i18n)

```
지원 언어:
- 한국어 (기본)
- 영어
- 일본어
- 중국어

STT 언어 자동 감지
OCR 언어 자동 감지
```

### 5️⃣ 접근성

| 항목 | 구현 |
|------|------|
| ARIA | 스크린 리더 지원 |
| 컬러 | 색상만으로 정보 전달 X |
| 폰트 | 최소 14px |
| 터치 | 최소 44x44px |

### 6️⃣ 테스트 전략

```
유닛 테스트:
- 개별 컴포넌트
- 유틸리티 함수

통합 테스트:
- API 통신
- 데이터베이스 CRUD

E2E 테스트:
- 전체 워크플로우
- 사용자 시나리오
```

---

## 다음 단계

1. ✅ UI/UX 디자인 확인 (완료)
2. ⏳ 컴포넌트 구현 (진행 중)
3. ⏳ API 통합 (예정)
4. ⏳ 테스트 (예정)
5. ⏳ 배포 (예정)

---

**마지막 업데이트**: 2026년 1월 6일  
**작성자**: GitHub Copilot  
**상태**: 완료
