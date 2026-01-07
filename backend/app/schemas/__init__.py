"""
Pydantic 스키마 (데이터 검증)
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ==================== User ==================== 

class UserBase(BaseModel):
    """사용자 기본 스키마"""
    email: EmailStr
    name: str
    avatar_emoji: str = "🐼"


class UserCreate(UserBase):
    """사용자 생성"""
    google_id: Optional[str] = None


class UserUpdate(BaseModel):
    """사용자 수정"""
    name: Optional[str] = None
    avatar_emoji: Optional[str] = None


class UserResponse(UserBase):
    """사용자 응답"""
    id: str
    google_id: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Todo ==================== 

class TodoBase(BaseModel):
    """할일 기본 스키마"""
    title: str
    description: Optional[str] = None
    date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    all_day: bool = False
    category: Optional[str] = None
    priority: str = "medium"
    status: str = "pending"


class TodoCreate(TodoBase):
    """할일 생성"""
    pass


class TodoUpdate(BaseModel):
    """할일 수정"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None


class TodoResponse(TodoBase):
    """할일 응답"""
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Receipt ==================== 

class ReceiptBase(BaseModel):
    """영수증 기본 스키마"""
    vendor: str
    purchase_date: date
    amount: Decimal
    payment_type: str  # cash, card, mobile
    card_brand: Optional[str] = None
    category: Optional[str] = None


class ReceiptCreate(ReceiptBase):
    """영수증 생성"""
    image_path: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    confidence_score: Optional[float] = None


class ReceiptResponse(ReceiptBase):
    """영수증 응답"""
    id: str
    user_id: str
    created_at: datetime
    is_verified: bool = False
    
    class Config:
        from_attributes = True


# ==================== Auth ==================== 

class GoogleLoginRequest(BaseModel):
    """
    Google 로그인 요청 (Main_PJ2 패턴 적용)
    
    두 가지 방식 지원:
    1. Authorization Code Flow (권장):
       - code: 인증 서버에서 받은 인증 코드
       - state: CSRF 방지 토큰
    
    2. Implicit Flow (테스트):
       - id_token: 직접 Google ID 토큰
       - state: CSRF 방지 토큰
    """
    code: Optional[str] = None  # Authorization Code Flow
    id_token: Optional[str] = None  # Implicit Flow
    state: str  # CSRF 방지


class AuthTokenResponse(BaseModel):
    """인증 토큰 응답"""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """토큰 갱신 요청"""
    refresh_token: str


# ==================== STT ==================== 

class STTRequest(BaseModel):
    """STT 요청"""
    context: str = "todo"  # todo, event, memo


class STTResponse(BaseModel):
    """STT 응답"""
    text: str
    date: Optional[date] = None
    time: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    confidence: float = 0.95


# ==================== OCR ==================== 

class OCRRequest(BaseModel):
    """OCR 요청"""
    context: str = "receipt"


class OCRResponse(BaseModel):
    """OCR 응답"""
    vendor: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[date] = None
    payment_type: Optional[str] = None
    card_brand: Optional[str] = None
    confidence: float = 0.95

# ==================== Family ==================== 

class FamilyMemberCreate(BaseModel):
    """가족 구성원 생성"""
    name: str
    emoji: str
    color: Optional[str] = None
    relation: Optional[str] = None  # self, spouse, child, parent, other


class FamilyMemberResponse(FamilyMemberCreate):
    """가족 구성원 응답"""
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Statistics ==================== 

class TodoStatsResponse(BaseModel):
    """할일 통계"""
    total: int
    completed: int
    pending: int
    overdue: int
    completion_rate: float


class ReceiptStatsResponse(BaseModel):
    """영수증 통계"""
    total_amount: float
    total_count: int
    average_amount: float
    payment_types: dict