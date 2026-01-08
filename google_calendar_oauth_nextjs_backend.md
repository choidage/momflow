# Google Calendar OAuth 연동 (Frontend: Next.js + Backend 분리형) — 전체 정리 + 예시 코드

본 문서는 **프론트(Next.js) + 별도 백엔드(API 서버)** 로 분리된 구조에서 Google Calendar API 접근을 위해 **OAuth 2.0 Authorization Code Flow**(사용자 동의 기반)를 구현하는 방법을 “구성 → 흐름 → 엔드포인트 설계 → 최소 구현 예시(Express)” 순서로 정리한 것입니다.

---

## 1) 전체 아키텍처(권장 책임 분리)

### Frontend (Next.js)
- “Google 캘린더 연결” 버튼 제공
- 백엔드의 OAuth 시작 엔드포인트로 **리다이렉트**
- 캘린더 데이터는 **직접 Google에서 가져오지 않고**, 반드시 **백엔드 API를 통해 조회**

### Backend (API 서버: Express/Nest/FastAPI 등)
- OAuth 2.0 Authorization Code Flow 처리 (**client_secret 보관**)
- 토큰 교환/갱신(refresh) 수행
- DB에 **refresh_token(암호화)** 저장
- Google Calendar API 호출 후 결과를 프론트에 반환

---

## 2) Google Cloud Console 설정(웹앱 + 백엔드 콜백)

1. 프로젝트 생성
2. **Google Calendar API 활성화**
3. OAuth 동의 화면 구성
4. **OAuth Client ID 생성: “Web application”**
   - Authorized redirect URI (백엔드 콜백)
     - 예: `https://api.example.com/auth/google/callback`
     - 로컬: `http://localhost:4000/auth/google/callback`

> 핵심: Redirect URI는 **백엔드**에 둡니다. 프론트가 아니라 “토큰 교환을 수행할 서버”가 콜백을 받는 구조입니다.

---

## 3) 권장 엔드포인트 설계

### Backend
- `GET /auth/google/start`
  - state(+PKCE 권장) 생성
  - Google 동의 화면 URL로 리다이렉트
- `GET /auth/google/callback`
  - code/state 검증
  - code → token 교환
  - refresh_token 저장(암호화)
  - 프론트의 완료 페이지로 리다이렉트
- `GET /api/calendar/events`
  - 사용자 refresh_token으로 access_token 갱신
  - Google Calendar API 호출
  - 결과를 JSON으로 반환

### Frontend (Next.js)
- “연결하기” 버튼 클릭 시:
  - `window.location.href = BACKEND_URL + "/auth/google/start?return_to=" + encodeURIComponent(FRONTEND_URL + "/settings/integrations")`
- 연결 완료 페이지(`/settings/integrations`)에서 쿼리(`connected=google`) 등을 보고 UI 표시

---

## 4) 데이터 저장(필수)

DB에는 최소 다음을 사용자별로 보관합니다.

- `google_refresh_token_enc` (암호화된 refresh token)
- `google_scope` (선택)
- `google_connected_at` (선택)
- “refresh_token이 이미 있음” 여부(연결 상태 플래그)

Access token은 만료가 짧아 **DB에 장기 저장하지 않는** 패턴이 일반적입니다(필요 시 캐시로만).

---

## 5) 최소 구현 예시 (Backend = Express)

### 5-1) 환경변수 예시

```bash
# Backend
PORT=4000
BACKEND_BASE_URL=http://localhost:4000
FRONTEND_BASE_URL=http://localhost:3000

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback

# refresh_token 저장 시 암호화에 사용할 키(예: 32바이트 이상 랜덤)
TOKEN_ENC_KEY=your-32bytes-min-secret-key........
```

---

### 5-2) Express 코드(핵심 라우트만)

> 아래 코드는 “최소 예시”입니다. 운영에서는 세션/인증(JWT/쿠키), DB 저장, 세션스토어(Redis), KMS 기반 암호화 등을 추가하세요.

```js
import express from "express";
import crypto from "crypto";

const app = express();

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  // 필요 시: "https://www.googleapis.com/auth/calendar.events"
];

// ---- (예시) 서버 메모리 저장소: 운영에서는 Redis/DB/세션스토어 권장
const oauthStore = new Map(); // state -> { userId, returnTo, createdAt, ... }

// ---- 간단 암호화(AES-256-GCM). 운영에서는 KMS/Secret Manager 권장
function encrypt(text, key) {
  const iv = crypto.randomBytes(12);
  const k = crypto.createHash("sha256").update(key).digest(); // 32 bytes
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

// 예: 로그인된 사용자 식별(세션/JWT 등). 여기서는 데모로 고정.
function getUserId(req) {
  return "demo-user-123";
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { access_token, expires_in, token_type, scope? }
}

// ---- TODO: DB 저장/조회는 프로젝트에 맞게 구현
async function saveRefreshToken(userId, refreshTokenEnc) {
  console.log("Save refresh token:", userId, refreshTokenEnc.slice(0, 16) + "...");
}
async function loadRefreshToken(userId) {
  // return decrypted refresh token in real impl
  throw new Error("Implement loadRefreshToken()");
}

// 1) OAuth 시작
app.get("/auth/google/start", (req, res) => {
  const userId = getUserId(req);
  const returnTo =
    typeof req.query.return_to === "string"
      ? req.query.return_to
      : `${process.env.FRONTEND_BASE_URL}/settings/integrations`;

  const state = crypto.randomBytes(24).toString("hex");

  oauthStore.set(state, {
    userId,
    returnTo,
    createdAt: Date.now(),
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",       // refresh_token 목적
    include_granted_scopes: "true",
    state,
    // prompt: "consent", // “처음 연결 때만” 쓰는 것을 권장(아래 참고)
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
});

// 2) 콜백: code -> token
app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;

    if (typeof code !== "string" || typeof state !== "string") {
      return res.status(400).send("Missing code/state");
    }

    const stored = oauthStore.get(state);
    if (!stored) return res.status(400).send("Invalid/expired state");

    oauthStore.delete(state);

    const tokens = await exchangeCodeForTokens(code);
    // tokens.refresh_token 은 “항상” 오지 않을 수 있음
    if (!tokens.refresh_token) {
      // 이미 과거에 동의한 계정이면 refresh_token이 생략될 수 있습니다.
      // 운영에서는 DB에 기존 refresh_token이 있는지 확인 후 처리합니다.
      return res.redirect(`${stored.returnTo}?connected=google&note=no_refresh_token`);
    }

    const refreshTokenEnc = encrypt(tokens.refresh_token, process.env.TOKEN_ENC_KEY);
    await saveRefreshToken(stored.userId, refreshTokenEnc);

    return res.redirect(`${stored.returnTo}?connected=google`);
  } catch (e) {
    return res.status(500).send(String(e?.message || e));
  }
});

// 3) 캘린더 이벤트 조회(백엔드가 Google API 호출)
app.get("/api/calendar/events", async (req, res) => {
  try {
    const userId = getUserId(req);
    const refreshToken = await loadRefreshToken(userId); // 복호화된 값 반환하도록 구현

    const at = await refreshAccessToken(refreshToken);
    const accessToken = at.access_token;

    const timeMin = new Date().toISOString();
    const params = new URLSearchParams({
      timeMin,
      maxResults: "10",
      singleEvents: "true",
      orderBy: "startTime",
    });

    const r = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();

    res.json(data);
  } catch (e) {
    res.status(500).send(String(e?.message || e));
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Backend running on port", process.env.PORT || 4000);
});
```

---

## 6) 프론트(Next.js)에서 연결 버튼 처리(예시)

```ts
const backend = process.env.NEXT_PUBLIC_BACKEND_BASE_URL; // 예: http://localhost:4000
const returnTo = `${window.location.origin}/settings/integrations`;

window.location.href =
  `${backend}/auth/google/start?return_to=` + encodeURIComponent(returnTo);
```

---

## 7) 운영에서 자주 발생하는 이슈와 처리 기준

### (1) refresh_token이 콜백에서 안 오는 경우
- 사용자가 과거에 이미 동의한 적이 있으면 `refresh_token`이 생략될 수 있습니다.
- 권장 처리:
  - DB에 refresh_token이 이미 있으면 “연결됨”으로 처리
  - 정말로 재발급이 필요할 때만 `prompt=consent`를 사용
  - 또는 사용자가 Google 계정 보안 설정에서 앱 권한을 제거 후 재연결

### (2) 보안 체크리스트
- `client_secret`은 **백엔드에만**
- state 검증 필수(가능하면 PKCE도 추가)
- refresh_token은 **암호화 저장**(KMS/Secret Manager/DB 암호화)
- HTTPS + 쿠키/SameSite 정책(세션 사용 시)
- Scope 최소화(읽기 전용부터 시작)

---

## 부록) 구현 시 흔히 추가되는 개선(권장)
- **PKCE** 적용 (특히 퍼블릭 클라이언트/SPA 성격이 강할수록 권장)
- state를 메모리(Map) 대신 **Redis**에 저장 + TTL 적용
- `return_to`를 화이트리스트로 제한(오픈 리다이렉트 방지)
- 사용자 인증(세션/JWT)과 OAuth 연결을 정확히 매핑
- refresh_token 재발급 조건 분기:
  - “DB에 refresh_token이 없을 때만” `prompt=consent` 사용
- Google API 호출 실패 시 재시도/에러 분류(401/403/429 등)

---
