# 🔧 MomFlow 서버 실행 가이드 및 문제 해결

## 빠른 시작 (권장)

```powershell
# 1. PowerShell을 관리자 모드로 열기
# 2. 다음 명령 실행:
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow
.\start-servers.ps1
```

---

## 반복되던 문제들의 원인과 해결책

### **1️⃣ npm install 시 peer dependency 충돌**

**문제:**
```
npm ERR! peer dependencies not installed
npm ERR! Found: react@18.3.1
```

**근본 원인:**
- Radix UI 컴포넌트들이 React의 특정 버전을 요구하지만 설치된 버전과 맞지 않음
- 매번 npm install할 때마다 이 충돌이 발생

**해결책:**
- ✅ `.npmrc` 파일 생성 완료 (자동으로 `--legacy-peer-deps` 적용)
- 앞으로 `npm install` 명령만으로 충돌 해결됨

---

### **2️⃣ Python 경로 오류**

**문제:**
```
ModuleNotFoundError: No module named 'app'
FileNotFoundError: [Errno 2] No such file or directory: '.env'
```

**근본 원인:**
- `main.py`가 상대경로(`./app/config.py`)로 import하는데, 다른 디렉토리에서 실행하면 경로를 찾을 수 없음
- `PYTHONPATH` 환경변수가 설정되지 않아 모듈 검색 경로가 잘못됨

**해결책:**
- ✅ `run.py` 스크립트 생성 완료
- 자동으로 작업 디렉토리와 PYTHONPATH 설정

**사용법:**
```powershell
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow\backend
python run.py
```

---

### **3️⃣ 프로세스 포트 충돌**

**문제:**
```
Address already in use
Process still running on port 8000/5173
```

**근본 원인:**
- 기존 프로세스가 종료되지 않았는데 새로 시작하려고 함
- 수동으로 프로세스를 찾아 종료해야 하는 번거로움

**해결책:**
- ✅ `start-servers.ps1` 스크립트 생성 완료
- 자동으로 기존 프로세스를 종료하고 새로 시작

**사용법:**
```powershell
# 서버 시작
.\start-servers.ps1

# 서버 재시작
.\start-servers.ps1 -Restart

# 서버 중지
.\start-servers.ps1 -Stop
```

---

## 상세 실행 가이드

### **방법 1: 자동 스크립트 (권장) ✅**

```powershell
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow
.\start-servers.ps1
```

**장점:**
- 🟢 자동으로 경로 설정
- 🟢 기존 프로세스 자동 정리
- 🟢 환경변수 자동 설정
- 🟢 서버 상태 자동 확인
- 🟢 한 번의 명령으로 모두 해결

---

### **방법 2: 수동 실행**

#### **백엔드만 시작:**
```powershell
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow\backend
python run.py
```

#### **프론트엔드만 시작:**
```powershell
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow\frontend
npm run dev
```

---

### **방법 3: 기존 방식 (문제 발생 가능)**

```powershell
# ❌ 이렇게 하면 경로 오류 발생 가능
python main.py                    # PYTHONPATH 설정 안 됨

# ✅ 올바른 방식
cd backend
python run.py                     # PYTHONPATH 자동 설정
```

---

## 문제 진단 및 해결

### **백엔드가 응답하지 않을 때:**

```powershell
# 1. 프로세스 확인
Get-Process python -ErrorAction SilentlyContinue

# 2. 포트 확인
netstat -ano | findstr :8000

# 3. 프로세스 강제 종료
Get-Process python | Stop-Process -Force

# 4. 다시 시작
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow\backend
python run.py
```

### **프론트엔드가 응답하지 않을 때:**

```powershell
# 1. node_modules 정리 (peer dependency 문제 시)
cd C:\Users\USER\OneDrive\Desktop\ainote\momflow\frontend
npm run reinstall

# 2. 다시 시작
npm run dev
```

---

## 🔍 확인 체크리스트

서버 시작 후 다음을 확인하세요:

- [ ] 백엔드 로그: `✅ Uvicorn running on http://0.0.0.0:8000`
- [ ] 프론트엔드 로그: `✅ Local: http://localhost:5173`
- [ ] 백엔드 헬스체크: `curl http://localhost:8000/health` → 200 OK
- [ ] 프론트엔드 접속: `http://localhost:5173` → 페이지 로드

---

## 📝 자주 묻는 질문

### **Q: 매번 --legacy-peer-deps를 붙여야 하나요?**
**A:** 아니요! `.npmrc` 파일이 자동으로 처리합니다. 이제 `npm install`만 하면 됩니다.

### **Q: 어떤 디렉토리에서 명령을 실행해도 되나요?**
**A:** `.ps1` 스크립트는 루트 디렉토리에서만 실행하세요. `run.py`는 backend 디렉토리에서 실행해야 합니다.

### **Q: 백엔드와 프론트엔드를 동시에 실행할 수 있나요?**
**A:** 네! `.start-servers.ps1` 스크립트가 자동으로 둘 다 백그라운드에서 실행합니다.

### **Q: 기존 node_modules는 어떻게 하나요?**
**A:** 필요시 `npm run reinstall`로 완전히 재설치할 수 있습니다.

---

## 🚀 다음 단계

서버가 정상 실행되면:

1. ✅ `http://localhost:5173`에서 프론트엔드 확인
2. ✅ Google OAuth 로그인 테스트
3. ✅ API 엔드포인트 테스트 (`http://localhost:8000/docs`)
4. ✅ 실제 기능 테스트 (STT, OCR, 캘린더 등)

---

**작성일:** 2025-01-06  
**최종 업데이트:** 2025-01-06
