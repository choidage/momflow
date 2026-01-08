# 프로젝트 경로 및 포트 구성

이 문서는 AI18_FINAL 워크스페이스의 두 프로젝트 경로와 포트 설정을 정리합니다.

## 📁 프로젝트 구조

```
C:\Users\USER\OneDrive\Desktop\AI18_FINAL\
├── 메인 프로젝트 (AI18_FINAL)
│   ├── backend/          → 포트 8000
│   ├── frontend/         → 포트 5173
│   └── start-servers.ps1 → 메인 프로젝트 시작 스크립트
│
└── always plan/          → 독립 실행 프로젝트
    ├── backend/          → 포트 8001
    ├── frontend/         → 포트 5174
    └── start-always-plan.ps1 → Always Plan 시작 스크립트
```

## 🚀 실행 방법

### 메인 프로젝트 (AI18_FINAL) 실행
```powershell
# AI18_FINAL 루트에서
.\start-servers.ps1

# 접속
# Backend:  http://localhost:8000
# Frontend: http://localhost:5173
```

### Always Plan 프로젝트 실행
```powershell
# AI18_FINAL\always plan 폴더에서
.\start-always-plan.ps1

# 접속
# Backend:  http://localhost:8001
# Frontend: http://localhost:5174
```

### 서버 중지
```powershell
# 메인 프로젝트
.\start-servers.ps1 -Stop

# Always Plan
.\start-always-plan.ps1 -Stop
```

### 서버 재시작
```powershell
# 메인 프로젝트
.\start-servers.ps1 -Restart

# Always Plan
.\start-always-plan.ps1 -Restart
```

## ⚙️ 포트 설정

| 프로젝트 | 백엔드 | 프론트엔드 | 설정 파일 |
|---------|--------|-----------|---------|
| **메인 (AI18_FINAL)** | 8000 | 5173 | backend/run.py, frontend/vite.config.ts |
| **Always Plan** | 8001 | 5174 | always plan/backend/run.py, always plan/frontend/vite.config.ts |

## 🔧 경로 설정

### 메인 프로젝트 경로
- **start-servers.ps1**: `C:\Users\USER\OneDrive\Desktop\AI18_FINAL`
- **backend/run.py**: 자동으로 현재 파일의 부모 디렉토리 사용
- **frontend/vite.config.ts**: API 프록시 → `http://localhost:8000`

### Always Plan 경로
- **start-always-plan.ps1**: `C:\Users\USER\OneDrive\Desktop\AI18_FINAL\always plan`
- **backend/run.py**: 자동으로 현재 파일의 부모 디렉토리 사용, 포트 8001
- **frontend/vite.config.ts**: API 프록시 → `http://localhost:8001`

## ✅ 충돌 방지

두 프로젝트는 **다른 포트**를 사용하므로 동시에 실행 가능합니다:

1. **포트 격리**: 메인(8000/5173) vs Always Plan(8001/5174)
2. **데이터베이스 격리**: 각 프로젝트는 자체 `backend/momflow.db` 사용
3. **환경변수 격리**: 각 프로젝트는 자체 `backend/.env` 사용

## 📝 주의사항

- 각 프로젝트의 시작 스크립트는 **해당 프로젝트 폴더에서만** 실행
- 데이터베이스와 .env 파일은 각 backend 폴더에 독립적으로 존재
- 메인 프로젝트를 수정해도 Always Plan에는 영향 없음 (반대도 동일)
