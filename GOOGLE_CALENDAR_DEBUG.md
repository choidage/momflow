# Google Calendar 연동 디버깅 가이드

## 데이터 저장 위치

### 1. Google Calendar 연동 정보 (OAuth 토큰)
- **테이블**: `users`
- **컬럼**: 
  - `google_calendar_token` (TEXT, 최대 2000자): JSON 형식의 OAuth 토큰
  - `google_calendar_enabled` (VARCHAR(10)): "true" 또는 "false"

**저장되는 데이터 예시:**
```json
{
  "access_token": "ya29.a0AfH6SMB...",
  "refresh_token": "1//0g...",
  "token_uri": "https://oauth2.googleapis.com/token",
  "client_id": "...",
  "client_secret": "...",
  "scopes": ["https://www.googleapis.com/auth/calendar", ...],
  "expiry": 3600
}
```

### 2. Google Calendar 이벤트
- **저장 위치**: **데이터베이스에 저장되지 않음**
- **저장 방식**: 프론트엔드 메모리에만 임시 저장 (페이지 새로고침 시 사라짐)
- **데이터 흐름**:
  1. 프론트엔드에서 `/calendar/events` API 호출
  2. 백엔드에서 Google Calendar API로 이벤트 가져오기
  3. 백엔드에서 이벤트를 앱 형식으로 변환
  4. 프론트엔드에서 받은 이벤트를 기존 todos와 병합하여 상태로 저장

## 연동 상태 확인 방법

### 백엔드 API
```
GET /calendar/status
```
**응답:**
```json
{
  "enabled": true,        // 연동 활성화 여부
  "connected": true,      // 토큰 존재 및 유효성
  "token_exists": true,   // 토큰 존재 여부
  "token_valid": true     // 토큰 유효성
}
```

### 프론트엔드 콘솔 로그
브라우저 개발자 도구 콘솔에서 다음 로그 확인:
- `[Google Calendar] 연동 상태 확인 중...`
- `[Google Calendar] 연동 상태: {...}`
- `[Google Calendar] 연동 활성화됨, 이벤트 가져오기 시작...`
- `[Google Calendar] 이벤트 응답: {...}`
- `[Google Calendar] 이벤트 X개 추가됨`

### 백엔드 로그
백엔드 서버 콘솔에서 다음 로그 확인:
- `[GET_GOOGLE_EVENTS] 요청 시작 - 사용자: ...`
- `[GET_GOOGLE_EVENTS] Google Calendar API 호출 시작...`
- `[GET_GOOGLE_EVENTS] Google Calendar 이벤트 X개 가져옴`

## 문제 해결 체크리스트

1. **연동이 안되는 경우**
   - 설정에서 Google Calendar 토글 활성화
   - Google OAuth 인증 완료 확인
   - `/calendar/status` 응답에서 `enabled: true, connected: true` 확인

2. **연동은 되지만 이벤트가 안불러와지는 경우**
   - 브라우저 콘솔에서 `[Google Calendar]` 로그 확인
   - 백엔드 로그에서 `[GET_GOOGLE_EVENTS]` 로그 확인
   - Google Calendar에 실제 이벤트가 있는지 확인
   - API 호출 에러 메시지 확인

3. **토큰 문제**
   - `users` 테이블에서 `google_calendar_token` 확인
   - 토큰이 유효한 JSON인지 확인
   - 토큰이 만료되지 않았는지 확인 (refresh_token 존재 여부)

## 수동 확인 방법

### SQLite 데이터베이스 확인
```sql
-- 사용자 정보 확인
SELECT id, email, google_calendar_enabled, 
       CASE WHEN google_calendar_token IS NOT NULL THEN '토큰 있음' ELSE '토큰 없음' END as token_status
FROM users 
WHERE deleted_at IS NULL;

-- 토큰 내용 확인 (일부만 표시)
SELECT email, 
       substr(google_calendar_token, 1, 100) as token_preview
FROM users
WHERE google_calendar_token IS NOT NULL;
```

