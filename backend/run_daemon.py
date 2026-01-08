#!/usr/bin/env python3
"""
Always Plan Backend - Daemon 모드 실행
PowerShell signal 처리 문제를 회피하기 위해 별도 프로세스로 실행
"""
import os
import sys
import subprocess
import time
from pathlib import Path

backend_dir = Path(__file__).parent
os.chdir(backend_dir)

print(f"✅ Backend 디렉토리: {backend_dir}")

# 이미 실행 중인 서버가 있는지 확인
try:
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 8000))
    sock.close()
    
    if result == 0:
        print("⚠️  포트 8000이 이미 사용 중입니다")
        print("   기존 프로세스를 종료하겠습니다...")
        os.system("netstat -ano | findstr :8000")
except Exception as e:
    pass

# 서버를 subprocess로 실행 (부모와 독립적)
print("\n🚀 Backend 서버 시작...")

try:
    # Windows에서 subprocess 생성 (CREATE_NEW_PROCESS_GROUP)
    if sys.platform == "win32":
        import subprocess
        
        # 새로운 프로세스 그룹으로 실행 (Ctrl+C 신호가 전달되지 않음)
        process = subprocess.Popen(
            [sys.executable, "server.py"],
            cwd=str(backend_dir),
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        print(f"✅ 서버 프로세스 시작 (PID: {process.pid})")
        print("   http://localhost:8000")
        print("\n   서버 중지: Ctrl+C를 누르거나 작업 관리자에서 종료")
        print("=" * 60)
        
        # stdout/stderr를 실시간으로 출력
        try:
            while process.poll() is None:
                try:
                    line = process.stdout.readline()
                    if line:
                        print(line.rstrip())
                except:
                    pass
                time.sleep(0.01)
            
            # 남은 출력 처리
            remaining = process.stdout.read()
            if remaining:
                print(remaining)
                
        except KeyboardInterrupt:
            print("\n\n⏹️  서버 종료 신호 수신...")
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print("강제 종료 중...")
                process.kill()
                process.wait()
            print("✅ 서버 종료됨")
    else:
        # Linux/Mac
        os.system(f"{sys.executable} server.py")
        
except Exception as e:
    print(f"❌ 에러: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
