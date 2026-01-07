# MomFlow UI/UX 대화형 구현 가이드

**작성일**: 2026년 1월 6일  
**프로젝트**: MomFlow  
**형식**: 질문 → 답변 → 실행 순서

---

## Q1: SST(음성 인식) 기능은 어떻게 구현하나요?

### A1: SST 구현 단계별 가이드

#### 1단계: Frontend에서 마이크 접근 권한 요청

```typescript
// src/components/VoiceRecording.tsx

import React, { useRef, useState } from 'react'

export const VoiceRecording: React.FC = () => {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      })
      mediaRecorder.current = new MediaRecorder(stream)
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        await sendToBackend(audioBlob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('마이크 접근 거부:', error)
    }
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setIsRecording(false)
  }

  const sendToBackend = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('language', 'ko-KR')

    try {
      const response = await axios.post(
        'http://localhost:8000/ai/stt/transcribe',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      setTranscript(response.data.transcription)
    } catch (error) {
      console.error('STT 변환 실패:', error)
    }
  }

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? '녹음 중지' : '녹음 시작'}
      </button>
      <p>{isRecording ? '🎤 녹음 중...' : ''}</p>
      <textarea value={transcript} readOnly />
    </div>
  )
}
```

#### 2단계: Backend에서 Gemini STT 처리

```python
# app/services/ai_service.py

import google.generativeai as genai
from app.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

class AIService:
    @staticmethod
    async def transcribe_audio(file_path: str, language: str = "ko-KR") -> dict:
        """
        음성 파일을 텍스트로 변환
        
        Args:
            file_path: 오디오 파일 경로
            language: 언어 코드
            
        Returns:
            {
                "transcription": "인식된 텍스트",
                "confidence": 0.95,
                "language_detected": "ko"
            }
        """
        try:
            # 오디오 파일 읽기
            with open(file_path, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            # Gemini API 호출
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # 오디오를 base64로 인코딩
            import base64
            audio_b64 = base64.b64encode(audio_data).decode()
            
            response = model.generate_content([
                {
                    "mime_type": "audio/wav",
                    "data": audio_b64
                },
                "이 오디오의 정확한 내용을 한국어로 텍스트화해줘"
            ])
            
            transcription = response.text
            
            return {
                "transcription": transcription,
                "confidence": 0.95,
                "language_detected": "ko"
            }
        except Exception as e:
            return {
                "error": str(e),
                "transcription": ""
            }
```

#### 3단계: Backend 엔드포인트

```python
# app/routes/ai.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/stt/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "ko-KR"
):
    """
    음성 파일을 텍스트로 변환하는 엔드포인트
    """
    if not file.filename.lower().endswith(('.mp3', '.wav', '.ogg', '.flac')):
        raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식")
    
    # 임시 파일로 저장
    import tempfile
    import os
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = await AIService.transcribe_audio(tmp_path, language)
        return result
    finally:
        os.unlink(tmp_path)
```

#### 4단계: 결과 저장

```python
# 투두나 메모로 저장하는 로직

@router.post("/stt/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "ko-KR",
    save_as: str = "memo",  # "memo", "todo", "note"
    user_id: str = Header(...)
):
    """
    음성을 텍스트로 변환하고 DB에 저장
    
    save_as 옵션:
    - "memo": 메모로 저장
    - "todo": 투두로 저장
    - "note": 노트로 저장
    """
    result = await AIService.transcribe_audio(tmp_path, language)
    
    if save_as == "todo":
        # 투두로 저장
        new_todo = Todo(
            user_id=user_id,
            title=result['transcription'],
            status="pending"
        )
        db.add(new_todo)
        db.commit()
    
    return result
```

---

## Q2: 카메라로 촬영한 사진에서 텍스트를 어떻게 추출하나요?

### A2: 카메라 촬영 및 OCR 처리 방법

#### 1단계: Frontend 카메라 컴포넌트

```typescript
// src/components/CameraCapture.tsx

import React, { useRef, useState } from 'react'

export const CameraCapture: React.FC<{ onCapture: (image: Blob) => void }> = ({ 
  onCapture 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error)
    }
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      context?.drawImage(videoRef.current, 0, 0)
      
      canvasRef.current.toBlob((blob) => {
        if (blob) onCapture(blob)
      }, 'image/jpeg', 0.95)
    }
  }

  return (
    <div>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <button onClick={startCamera} disabled={isCameraActive}>
        카메라 시작
      </button>
      <button onClick={takePhoto} disabled={!isCameraActive}>
        📷 사진 촬영
      </button>
    </div>
  )
}
```

#### 2단계: Backend OCR 처리 (Claude Vision)

```python
# app/services/ai_service.py

import anthropic
from app.config import CLAUDE_API_KEY

claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

class AIService:
    @staticmethod
    async def extract_receipt(image_path: str) -> dict:
        """
        영수증 이미지에서 정보 추출
        """
        with open(image_path, 'rb') as img_file:
            image_data = base64.b64encode(img_file.read()).decode()
        
        message = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": """이 영수증 이미지에서 다음 정보를 추출해줘. JSON 형식으로 반환:
{
    "vendor": "매장명",
    "amount": 금액(숫자만),
    "currency": "KRW",
    "date": "YYYY-MM-DD",
    "payment_type": "card/cash/digital",
    "items": ["상품1", "상품2"],
    "confidence": 0.95
}"""
                        }
                    ],
                }
            ],
        )
        
        # JSON 파싱
        import json
        result_text = message.content[0].text
        # JSON 부분만 추출
        json_start = result_text.find('{')
        json_end = result_text.rfind('}') + 1
        json_str = result_text[json_start:json_end]
        
        return json.loads(json_str)
    
    @staticmethod
    async def extract_text(image_path: str) -> dict:
        """
        일반 이미지에서 텍스트 추출
        """
        with open(image_path, 'rb') as img_file:
            image_data = base64.b64encode(img_file.read()).decode()
        
        message = claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "이 이미지에서 모든 텍스트를 정확하게 추출해줘"
                        }
                    ],
                }
            ],
        )
        
        return {
            "text": message.content[0].text,
            "language": "ko",
            "confidence": 0.92
        }
```

#### 3단계: Backend OCR 엔드포인트

```python
# app/routes/ai.py

@router.post("/ocr/extract-receipt")
async def extract_receipt_ocr(
    file: UploadFile = File(...),
    user_id: str = Header(...)
):
    """
    영수증 사진에서 정보 추출
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = await AIService.extract_receipt(tmp_path)
        
        # DB에 저장
        receipt = Receipt(
            user_id=user_id,
            vendor=result.get('vendor'),
            amount=result.get('amount'),
            payment_type=result.get('payment_type'),
            date=result.get('date'),
            items=result.get('items'),
            confidence=result.get('confidence'),
            image_url=f"receipts/{user_id}/{uuid4()}.jpg"
        )
        db.add(receipt)
        db.commit()
        
        return {
            **result,
            "receipt_id": receipt.id,
            "saved": True
        }
    finally:
        os.unlink(tmp_path)

@router.post("/ocr/extract-text")
async def extract_text_ocr(
    file: UploadFile = File(...)
):
    """
    이미지에서 텍스트 추출
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = await AIService.extract_text(tmp_path)
        return result
    finally:
        os.unlink(tmp_path)
```

#### 4단계: Frontend에서 OCR 결과 처리

```typescript
// src/components/ReceiptProcessor.tsx

const handleImageCapture = async (imageBlob: Blob) => {
  const formData = new FormData()
  formData.append('file', imageBlob, 'receipt.jpg')

  try {
    setProcessing(true)
    const response = await axios.post(
      'http://localhost:8000/ai/ocr/extract-receipt',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )

    // 추출된 정보 표시
    setReceiptData({
      vendor: response.data.vendor,
      amount: response.data.amount,
      date: response.data.date,
      items: response.data.items,
      confidence: response.data.confidence
    })

    // 사용자 수정 가능하게 표시
    showReceiptEditModal(response.data)
  } catch (error) {
    console.error('OCR 처리 실패:', error)
  } finally {
    setProcessing(false)
  }
}
```

---

## Q3: SQLite 데이터베이스는 어떻게 구축하나요?

### A3: SQLite 데이터베이스 설정 및 초기화

#### 1단계: 데이터베이스 파일 생성

```python
# app/database/__init__.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.base import Base

# SQLite 데이터베이스 경로
DB_DIR = os.path.join(os.path.dirname(__file__), '../../data')
os.makedirs(DB_DIR, exist_ok=True)
DB_FILE = os.path.join(DB_DIR, 'momflow.db')

# SQLite 연결 문자열
DATABASE_URL = f"sqlite:///{DB_FILE}"

# 엔진 생성
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False  # SQL 쿼리 출력 여부
)

# 세션 팩토리
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 테이블 초기화 함수
def init_db():
    """앱 시작 시 테이블 생성"""
    Base.metadata.create_all(bind=engine)

# 의존성 주입 함수
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 2단계: Main.py에서 초기화

```python
# main.py

from fastapi import FastAPI
from app.database import init_db
from app.config import settings

app = FastAPI()

# 앱 시작 시 DB 초기화
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ Database initialized")

# 헬스 체크
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "database": "connected",
        "version": "1.0.0"
    }
```

#### 3단계: 모든 ORM 모델

```python
# app/models/models.py

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey, Float
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
    
    todos = relationship("Todo", back_populates="user", cascade="all, delete-orphan")
    receipts = relationship("Receipt", back_populates="user", cascade="all, delete-orphan")
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")

class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date = Column(String, nullable=False)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, overdue
    priority = Column(String, default="medium")  # low, medium, high
    tags = Column(JSON, nullable=True)
    repeat = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="todos")
    checklist_items = relationship("ChecklistItem", back_populates="todo", cascade="all, delete-orphan")

class Receipt(Base):
    __tablename__ = "receipts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    vendor = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    payment_type = Column(String, default="card")
    category = Column(String, nullable=True)
    date = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    extracted_text = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    items = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="receipts")

class FamilyMember(Base):
    __tablename__ = "family_members"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    emoji = Column(String, nullable=True)
    color = Column(String, nullable=True)
    relation = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="family_members")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    todo_id = Column(String, ForeignKey("todos.id"), nullable=False)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    order_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    todo = relationship("Todo", back_populates="checklist_items")
```

---

## Q4: API는 어디서 사용되고 어떻게 연결되나요?

### A4: API 사용 위치 및 연결 방법

#### 1단계: Frontend API 클라이언트 설정

```typescript
// src/services/apiClient.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      withCredentials: true // httpOnly 쿠키 포함
    })

    // Request 인터셉터
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response 인터셉터
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const newToken = await this.refreshToken()
            localStorage.setItem('access_token', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.client(originalRequest)
          } catch (err) {
            // 로그인 페이지로 이동
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private async refreshToken(): Promise<string> {
    const response = await this.client.post('/auth/refresh')
    return response.data.access_token
  }

  // Public 메소드들
  public async get<T>(url: string): Promise<T> {
    return (await this.client.get(url)).data
  }

  public async post<T>(url: string, data: any): Promise<T> {
    return (await this.client.post(url, data)).data
  }

  public async put<T>(url: string, data: any): Promise<T> {
    return (await this.client.put(url, data)).data
  }

  public async delete<T>(url: string): Promise<T> {
    return (await this.client.delete(url)).data
  }
}

export const apiClient = new APIClient()
```

#### 2단계: API 사용 위치 맵핑

| 컴포넌트 | API 엔드포인트 | 용도 |
|---------|--------------|------|
| LoginScreen | POST /auth/google-login | 로그인 |
| TodoItem | GET /todos/{id} | 투두 조회 |
| AddTodoModal | POST /todos/ | 투두 생성 |
| TodoDetailSheet | PUT /todos/{id} | 투두 수정 |
| TodoItem | DELETE /todos/{id} | 투두 삭제 |
| TodayScreen | GET /todos/today | 오늘 일정 |
| CalendarHomeScreen | GET /todos | 월간 일정 |
| VoiceRecording | POST /ai/stt/transcribe | 음성 인식 |
| CameraCapture | POST /ai/ocr/extract-receipt | 영수증 OCR |
| CameraCapture | POST /ai/ocr/extract-text | 텍스트 추출 |
| ReceiptList | GET /receipts | 영수증 목록 |
| AddReceiptModal | POST /receipts/ | 영수증 생성 |
| FamilyScreen | GET /family/members | 가족 멤버 |
| MemberAddSheet | POST /family/members | 멤버 추가 |

#### 3단계: 컴포넌트에서 API 호출

```typescript
// src/components/TodoItem.tsx

import { apiClient } from '../services/apiClient'
import { useState, useEffect } from 'react'

export const TodoItem: React.FC<{ todoId: string }> = ({ todoId }) => {
  const [todo, setTodo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTodo()
  }, [todoId])

  const fetchTodo = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get(`/todos/${todoId}`)
      setTodo(data)
    } catch (error) {
      console.error('투두 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTodoStatus = async (newStatus: string) => {
    try {
      const response = await apiClient.put(`/todos/${todoId}`, {
        status: newStatus
      })
      setTodo(response)
    } catch (error) {
      console.error('투두 수정 실패:', error)
    }
  }

  const deleteTodo = async () => {
    if (confirm('이 투두를 삭제하시겠어요?')) {
      try {
        await apiClient.delete(`/todos/${todoId}`)
        // 목록 새로고침
        window.location.reload()
      } catch (error) {
        console.error('투두 삭제 실패:', error)
      }
    }
  }

  if (loading) return <p>로딩 중...</p>
  if (!todo) return null

  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={todo.status === 'completed'}
        onChange={(e) => updateTodoStatus(e.target.checked ? 'completed' : 'pending')}
      />
      <span>{todo.title}</span>
      <button onClick={deleteTodo}>삭제</button>
    </div>
  )
}
```

---

## Q5: 데이터는 어떤 순서로 흘러다니나요?

### A5: 전체 데이터 흐름도

#### 투두 추가 흐름

```
사용자가 "투두 추가" 버튼 클릭
   ↓ (Frontend)
AddTodoModal 컴포넌트 렌더링
   ↓
사용자가 제목, 날짜, 우선순위 입력
   ↓
POST /todos/ 호출
   ├── Headers: { Authorization: "Bearer {token}" }
   ├── Body: { title, date, priority, tags }
   └── withCredentials: true (httpOnly 쿠키)
   
   ↓ (Backend)
   
CORS 미들웨어 처리
   ↓
JWT 토큰 검증
   ├── 유효: 사용자 ID 추출
   └── 무효: 401 Unauthorized
   
   ↓
Route Handler
   ├── 데이터 검증 (Pydantic)
   ├── 새 Todo 객체 생성
   └── SQLAlchemy ORM으로 DB에 저장
   
   ↓ (Database)
   
INSERT INTO todos (id, user_id, title, date, priority, ...)
   ↓
201 Created + Todo 객체 반환
   
   ↓ (Frontend)
   
Response 인터셉터
   ├── 상태 코드 확인
   └── 성공 시 데이터 저장
   
   ↓
State 업데이트
   ├── setTodos([...todos, newTodo])
   └── UI 리렌더링
   
   ↓
사용자에게 투두 목록 표시
```

#### 카메라 OCR 흐름

```
사용자가 카메라 앱 실행
   ↓
CameraCapture 컴포넌트
   ├── navigator.mediaDevices.getUserMedia() 호출
   └── 사용자 마이크/카메라 권한 승인
   
   ↓
카메라 프리뷰 표시
   ↓
사용자가 "촬영" 버튼 클릭
   ↓
canvas.drawImage(videoStream)로 이미지 캡처
   ↓
canvas.toBlob()로 이미지 데이터 추출
   
   ↓ (Frontend)
   
FormData 객체 생성
   ├── file: image blob
   └── Headers: multipart/form-data
   
   ↓
POST /ai/ocr/extract-receipt
   
   ↓ (Backend)
   
1. 파일 유효성 검사
   ├── 형식 확인 (JPG, PNG, WEBP)
   ├── 크기 확인 (max 10MB)
   └── 해상도 확인 (min 800x600)
   
   ↓
2. 파일 전처리
   ├── 회전 보정 (Pillow)
   ├── 해상도 최적화
   └── 노이즈 제거
   
   ↓
3. Claude Vision API 호출
   ├── Base64로 인코딩
   ├── 프롬프트: "영수증에서 매장명, 금액, 날짜, 항목 추출"
   └── 응답 대기
   
   ↓
4. 응답 처리
   ├── JSON 파싱
   ├── 신뢰도 확인
   └── DB에 저장
   
   ↓ (Database)
   
INSERT INTO receipts (vendor, amount, date, items, ...)
   
   ↓
API 응답 반환
   └── {
        vendor: "CU 편의점",
        amount: 12500,
        items: ["핫초콜릿", "삼각김밥"],
        confidence: 0.95,
        receipt_id: "UUID"
       }
   
   ↓ (Frontend)
   
ReceiptEditModal 표시
   ├── 추출된 정보 표시
   └── 사용자 수정 가능
   
   ↓
"저장" 클릭
   ├── 수정사항 PUT /receipts/{id}
   └── DB 업데이트
   
   ↓
영수증 목록 새로고침
   ├── GET /receipts/
   └── UI 업데이트
```

---

## Q6: 에러가 발생하면 어떻게 처리하나요?

### A6: 에러 처리 전략

#### Frontend 에러 처리

```typescript
// src/services/apiClient.ts

this.client.interceptors.response.use(
  response => response,
  async error => {
    const { status, data } = error.response || {}
    
    // 에러 타입별 처리
    switch (status) {
      case 401: // Unauthorized
        // 토큰 갱신 시도
        try {
          const newToken = await this.refreshToken()
          localStorage.setItem('access_token', newToken)
          // 원래 요청 재시도
          return this.client(error.config)
        } catch {
          // 갱신 실패 → 로그인 페이지로 이동
          window.location.href = '/login'
        }
        break
      
      case 403: // Forbidden
        showErrorToast('권한이 없습니다')
        break
      
      case 404: // Not Found
        showErrorToast('요청한 자원을 찾을 수 없습니다')
        break
      
      case 422: // Validation Error
        showErrorToast(`입력 오류: ${data.detail}`)
        break
      
      case 500: // Server Error
        showErrorToast('서버 오류가 발생했습니다')
        // 로컬 저장소에 기록
        logErrorToLocal(error)
        break
      
      default:
        showErrorToast('요청 처리 중 오류가 발생했습니다')
    }
    
    return Promise.reject(error)
  }
)
```

#### Backend 에러 처리

```python
# app/routes/todos.py

from fastapi import HTTPException, status

@router.post("/")
async def create_todo(
    todo_data: TodoCreate,
    user_id: str = Depends(get_current_user)
):
    try:
        # 데이터 검증 (Pydantic에서 자동 처리)
        # 422 Validation Error 반환
        
        # 비즈니스 로직
        if not todo_data.title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="제목은 필수입니다"
            )
        
        # DB 저장
        try:
            todo = Todo(**todo_data.dict(), user_id=user_id)
            db.add(todo)
            db.commit()
            db.refresh(todo)
            return todo
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="데이터베이스 저장 실패"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="예기치 않은 오류가 발생했습니다"
        )
```

---

## Q7: 오프라인에서는 어떻게 동작하나요?

### A7: PWA 오프라인 지원

#### 1단계: Service Worker 등록

```typescript
// src/main.tsx

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(
    registration => {
      console.log('Service Worker 등록 완료', registration)
    },
    error => {
      console.log('Service Worker 등록 실패', error)
    }
  )
}
```

#### 2단계: Service Worker 캐싱 전략

```typescript
// public/sw.js

const CACHE_NAME = 'momflow-v1'
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/index.css',
  '/assets/app.js',
  // 주요 리소스들
]

// 설치 단계
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE)
    })
  )
})

// 요청 인터셉트
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // 캐시에 있으면 반환
        if (response) {
          return response
        }
        
        // 없으면 네트워크 요청
        return fetch(event.request).then((response) => {
          // 응답 캐싱
          const clonedResponse = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
          return response
        }).catch(() => {
          // 네트워크 실패 → 오프라인 페이지 반환
          return caches.match('/offline.html')
        })
      })
    )
  }
})
```

#### 3단계: 오프라인 데이터 저장 (IndexedDB)

```typescript
// src/services/offlineStorage.ts

import { openDB } from 'idb'

const DB_NAME = 'momflow-offline'

export class OfflineStorage {
  private db: any

  async init() {
    this.db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        // 오프라인 저장소
        db.createObjectStore('pending-requests', { keyPath: 'id' })
        db.createObjectStore('cached-todos', { keyPath: 'id' })
        db.createObjectStore('cached-receipts', { keyPath: 'id' })
      }
    })
  }

  async savePendingRequest(request: any) {
    // 온라인 복구 때까지 저장
    await this.db.put('pending-requests', request)
  }

  async getPendingRequests() {
    return await this.db.getAll('pending-requests')
  }

  async clearPendingRequest(id: string) {
    await this.db.delete('pending-requests', id)
  }

  async cacheData(storeName: string, data: any) {
    await this.db.put(storeName, data)
  }
}

export const offlineStorage = new OfflineStorage()
```

#### 4단계: 오프라인 모드 UI

```typescript
// src/components/OfflineBanner.tsx

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="offline-banner">
      📡 오프라인 상태입니다. 변경사항은 온라인 복구 시 동기화됩니다.
    </div>
  )
}
```

---

## 정리

MomFlow의 전체 구현 흐름:
1. **인증**: Google OAuth → JWT 토큰
2. **음성**: 마이크 → WAV 파일 → Gemini STT → 텍스트
3. **이미지**: 카메라 → JPEG → Claude Vision → 정보 추출
4. **저장**: 추출된 데이터 → SQLite DB → 목록 표시
5. **동기화**: 온라인/오프라인 전환 시 자동 동기화

모든 기능이 REST API로 통합되며, 오프라인 지원으로 언제든 사용 가능합니다.

---

**마지막 업데이트**: 2026년 1월 6일  
**형식**: 질문-답변-코드 예시  
**다음 단계**: 각 컴포넌트 구현 시작
