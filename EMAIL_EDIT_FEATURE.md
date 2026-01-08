# 이메일 수정 기능 구현 완료

## 개요
마이페이지(MyPage)에서 사용자 이메일을 수정할 수 있는 기능을 완전히 구현했습니다.

## 구현된 기능

### 1. Backend API Endpoint (PUT /auth/profile)
**경로**: `backend/app/api/routes/auth.py` (라인 389-449)

```python
@router.put("/profile")
async def update_profile(
    email: Optional[str] = None,
    name: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
)
```

**기능:**
- Query parameters로 `email`과 `name` 받음
- JWT 토큰으로 사용자 인증
- 이메일 중복 검사
- 프로필 정보 업데이트
- 성공/에러 응답 반환

**응답 예시:**
```json
{
  "status": "success",
  "message": "프로필이 수정되었습니다",
  "email": "newemail@example.com",
  "name": "사용자 이름"
}
```

### 2. Frontend UI Component (MyPageScreen.tsx)
**경로**: `frontend/src/app/components/MyPageScreen.tsx`

**주요 기능:**
- ✏️ 이메일 편집 버튼 추가
- 📝 Inline 편집 모드
- ✅ 이메일 유효성 검사
- 💾 저장/취소 버튼
- ⏳ 로딩 상태 표시
- ⚠️ 에러 메시지 표시

**코드 구조:**
```tsx
// 상태 관리
const [isEditingEmail, setIsEditingEmail] = useState(false);
const [tempEmail, setTempEmail] = useState(userEmail);
const [isLoading, setIsLoading] = useState(false);

// 이메일 저장 함수
const handleSaveEmail = async () => {
  // 1. 유효성 검사
  // 2. API 호출
  // 3. 에러 처리
  // 4. UI 업데이트
}
```

### 3. API Client Method (apiClient.ts)
**경로**: `frontend/src/services/apiClient.ts` (라인 218-225)

```typescript
async updateProfile(email?: string, name?: string) {
  return this.client.put('/auth/profile', {}, {
    params: {
      ...(email && { email }),
      ...(name && { name }),
    },
  })
}
```

## 사용 방법

### 1. 앱에 로그인
- Google OAuth를 통해 로그인하거나 테스트 로그인 사용

### 2. 마이페이지 열기
- 오른쪽 상단의 프로필 아이콘 클릭
- "마이페이지" 항목 선택

### 3. 이메일 수정
1. 계정 정보 섹션의 이메일 필드 옆 ✏️ 버튼 클릭
2. 새로운 이메일 입력
3. "저장" 버튼 클릭
4. 성공 메시지 확인

### 4. 유효성 검사
- 이메일이 비어있으면 에러
- 유효한 이메일 형식이 아니면 에러 (예: test@example.com)
- 이미 사용 중인 이메일이면 에러

## 에러 처리

### Frontend 유효성 검사
```javascript
// 빈 값 체크
if (!tempEmail.trim()) {
  toast.error("이메일을 입력해주세요.");
  return;
}

// 형식 체크
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(tempEmail)) {
  toast.error("유효한 이메일 형식이 아닙니다.");
  return;
}
```

### Backend 유효성 검사
- 이메일 중복 검사
- JWT 토큰 검증
- 프로필 업데이트 오류 처리

## 테스트 API 호출

### cURL 예시
```bash
# 테스트 사용자 생성
curl -X POST http://localhost:8000/auth/test-google-login

# 응답에서 access_token과 user_id 추출
# 이메일 수정
curl -X PUT "http://localhost:8000/auth/profile?email=newemail@example.com" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### PowerShell 예시
```powershell
# 테스트 사용자 생성
$response = Invoke-WebRequest -Uri "http://localhost:8000/auth/test-google-login" -Method Post
$json = $response.Content | ConvertFrom-Json
$token = $json.access_token

# 이메일 수정
$updateResp = Invoke-WebRequest `
  -Uri "http://localhost:8000/auth/profile?email=newemail@example.com" `
  -Method Put `
  -Headers @{"Authorization"="Bearer $token"}
```

## 파일 변경 사항

### Backend
- ✅ `backend/app/api/routes/auth.py` - PUT /auth/profile 엔드포인트 추가
- ✅ `backend/app/models/user.py` - Google Calendar 필드 추가

### Frontend
- ✅ `frontend/src/app/components/MyPageScreen.tsx` - 이메일 편집 UI 추가
- ✅ `frontend/src/services/apiClient.ts` - updateProfile 메서드 추가

## 다음 단계

1. ✅ 이메일 수정 기능 테스트
2. ⏳ Backend 안정성 개선
3. ⏳ 프로필 사진 업로드 기능 추가
4. ⏳ 비밀번호 변경 기능 추가

## 참고사항

- 이메일 변경 시 JWT 토큰은 유효합니다 (사용자 ID 기반 인증)
- 중복된 이메일로는 변경할 수 없습니다
- 취소 버튼으로 변경 없이 종료 가능
